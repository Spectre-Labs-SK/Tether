import { useState, useEffect, useCallback } from 'react';
import { supabase, type JointOp, type OpMember, type OpCheckpoint, type OpHRSync } from '../lib/supabase';
import { agentLog } from '../lib/agentLog';

export type JointOpsReturn = {
  ops: JointOp[];
  isLoading: boolean;
  createOp: (codename: string, shimmerMode?: 'MILITARY' | 'ETHER', notes?: string) => Promise<JointOp | null>;
  setOpStatus: (opId: string, status: JointOp['status']) => Promise<void>;
  setClashState: (opId: string, state: JointOp['clash_state']) => Promise<void>;
  addMember: (opId: string, profileId: string, role?: OpMember['role']) => Promise<void>;
  removeMember: (opId: string, profileId: string) => Promise<void>;
  getCheckpoints: (opId: string) => Promise<OpCheckpoint[]>;
  createCheckpoint: (opId: string, title: string, opts?: Partial<Pick<OpCheckpoint, 'priority' | 'assigned_to' | 'due_at'>>) => Promise<OpCheckpoint | null>;
  updateCheckpointStatus: (checkpointId: string, status: OpCheckpoint['status']) => Promise<void>;
  syncHR: (opId: string, bpm: number) => Promise<void>;
  getOpHR: (opId: string) => Promise<OpHRSync[]>;
};

export function useJointOps(userId: string | null): JointOpsReturn {
  const [ops, setOps] = useState<JointOp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadOps = async () => {
      agentLog.architect(`Loading joint ops for userId: ${userId}`);

      const { data, error } = await supabase
        .from('joint_ops')
        .select('*')
        .or(`owner_id.eq.${userId},id.in.(select op_id from op_members where profile_id = '${userId}')`)
        .order('created_at', { ascending: false });

      if (error) {
        agentLog.architect(`ERROR loading joint ops: ${error.message}`);
      } else {
        setOps(data ?? []);
        agentLog.architect(`Joint ops loaded: ${data?.length ?? 0} ops`);
      }

      setIsLoading(false);
    };

    loadOps();
  }, [userId]);

  const createOp = useCallback(async (
    codename: string,
    shimmerMode: 'MILITARY' | 'ETHER' = 'MILITARY',
    notes?: string,
  ): Promise<JointOp | null> => {
    if (!userId) return null;

    agentLog.architect(`Creating joint op: "${codename}" [${shimmerMode}]`);

    const { data, error } = await supabase
      .from('joint_ops')
      .insert({ owner_id: userId, codename, shimmer_mode: shimmerMode, notes: notes ?? null })
      .select()
      .single();

    if (error || !data) {
      agentLog.architect(`ERROR creating joint op: ${error?.message}`);
      return null;
    }

    // Auto-enlist owner as commander
    await supabase
      .from('op_members')
      .insert({ op_id: data.id, profile_id: userId, role: 'commander' });

    setOps(prev => [data, ...prev]);
    agentLog.valkyrie(`Joint Op "${codename}" established. Commander online.`);
    return data;
  }, [userId]);

  const setClashState = useCallback(async (opId: string, state: JointOp['clash_state']): Promise<void> => {
    agentLog.architect(`Updating op ${opId} clash_state → ${state}`);

    const { data, error } = await supabase
      .from('joint_ops')
      .update({ clash_state: state })
      .eq('id', opId)
      .select()
      .single();

    if (error) {
      agentLog.architect(`ERROR updating clash_state: ${error.message}`);
      return;
    }

    setOps(prev => prev.map(op => (op.id === opId ? data : op)));

    if (state === 'contested') {
      agentLog.valkyrie(`Clash detected on op ${opId}. Conflict flagged. Resolve before proceeding.`);
    } else if (state === 'locked') {
      agentLog.valkyrie(`Op ${opId} LOCKED. All movement suspended pending clash resolution.`);
    } else {
      agentLog.valkyrie(`Clash cleared on op ${opId}. Op nominal.`);
    }
  }, []);

  const setOpStatus = useCallback(async (opId: string, status: JointOp['status']): Promise<void> => {
    agentLog.architect(`Updating op ${opId} status → ${status}`);

    const { data, error } = await supabase
      .from('joint_ops')
      .update({ status })
      .eq('id', opId)
      .select()
      .single();

    if (error) {
      agentLog.architect(`ERROR updating op status: ${error.message}`);
      return;
    }

    setOps(prev => prev.map(op => (op.id === opId ? data : op)));
  }, []);

  const addMember = useCallback(async (
    opId: string,
    profileId: string,
    role: OpMember['role'] = 'operative',
  ): Promise<void> => {
    agentLog.architect(`Adding member ${profileId} to op ${opId} as ${role}`);

    const { error } = await supabase
      .from('op_members')
      .insert({ op_id: opId, profile_id: profileId, role });

    if (error) {
      agentLog.architect(`ERROR adding member: ${error.message}`);
    } else {
      agentLog.valkyrie(`Operative ${profileId} joined the op. Role: ${role}.`);
    }
  }, []);

  const removeMember = useCallback(async (opId: string, profileId: string): Promise<void> => {
    agentLog.architect(`Removing member ${profileId} from op ${opId}`);

    const { error } = await supabase
      .from('op_members')
      .delete()
      .eq('op_id', opId)
      .eq('profile_id', profileId);

    if (error) {
      agentLog.architect(`ERROR removing member: ${error.message}`);
    }
  }, []);

  const getCheckpoints = useCallback(async (opId: string): Promise<OpCheckpoint[]> => {
    agentLog.architect(`Fetching checkpoints for op ${opId}`);

    const { data, error } = await supabase
      .from('op_checkpoints')
      .select('*')
      .eq('op_id', opId)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      agentLog.architect(`ERROR fetching checkpoints: ${error.message}`);
      return [];
    }

    return data ?? [];
  }, []);

  const createCheckpoint = useCallback(async (
    opId: string,
    title: string,
    opts?: Partial<Pick<OpCheckpoint, 'priority' | 'assigned_to' | 'due_at'>>,
  ): Promise<OpCheckpoint | null> => {
    agentLog.architect(`Creating checkpoint "${title}" for op ${opId}`);

    const { data, error } = await supabase
      .from('op_checkpoints')
      .insert({
        op_id: opId,
        title,
        priority: opts?.priority ?? 2,
        assigned_to: opts?.assigned_to ?? null,
        due_at: opts?.due_at ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      agentLog.architect(`ERROR creating checkpoint: ${error?.message}`);
      return null;
    }

    agentLog.valkyrie(`Checkpoint "${title}" set. Priority ${data.priority}. Standing by.`);
    return data;
  }, []);

  const updateCheckpointStatus = useCallback(async (
    checkpointId: string,
    status: OpCheckpoint['status'],
  ): Promise<void> => {
    agentLog.architect(`Checkpoint ${checkpointId} → ${status}`);

    const update: Record<string, unknown> = { status };
    if (status === 'complete') update.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('op_checkpoints')
      .update(update)
      .eq('id', checkpointId);

    if (error) {
      agentLog.architect(`ERROR updating checkpoint: ${error.message}`);
    }
  }, []);

  const syncHR = useCallback(async (opId: string, bpm: number): Promise<void> => {
    if (!userId) return;

    agentLog.architect(`HR sync: op=${opId} bpm=${bpm} profile=${userId}`);

    const { error } = await supabase
      .from('op_hr_sync')
      .insert({ op_id: opId, profile_id: userId, bpm });

    if (error) {
      agentLog.architect(`ERROR syncing HR: ${error.message}`);
    } else {
      agentLog.valkyrie(`HR broadcast: ${bpm} bpm. Squad can see your vitals.`);
    }
  }, [userId]);

  const getOpHR = useCallback(async (opId: string): Promise<OpHRSync[]> => {
    agentLog.architect(`Fetching HR sync for op ${opId}`);

    const { data, error } = await supabase
      .from('op_hr_sync')
      .select('*')
      .eq('op_id', opId)
      .order('recorded_at', { ascending: false })
      .limit(50);

    if (error) {
      agentLog.architect(`ERROR fetching op HR: ${error.message}`);
      return [];
    }

    return data ?? [];
  }, []);

  return {
    ops,
    isLoading,
    createOp,
    setOpStatus,
    setClashState,
    addMember,
    removeMember,
    getCheckpoints,
    createCheckpoint,
    updateCheckpointStatus,
    syncHR,
    getOpHR,
  };
}
