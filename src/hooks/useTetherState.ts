import { useState, useEffect } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import { agentLog } from '../lib/agentLog';

export type UIConfig = 'full' | 'minimalist';

export type TetherStateReturn = {
  profile: Profile | null;
  uiConfig: UIConfig;
  isLoading: boolean;
  triggerCrisisMode: () => Promise<void>;
  exitCrisisMode: () => Promise<void>;
};

const ADJECTIVES = ['ghost', 'shadow', 'void', 'echo', 'neon', 'cipher', 'static', 'drift', 'nova', 'phantom'];
const NOUNS      = ['hawk', 'circuit', 'signal', 'protocol', 'node', 'matrix', 'vector', 'pulse', 'relay', 'core'];

function generateRandomHandle(): string {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num  = Math.floor(Math.random() * 999) + 1;
  return `${adj}-${noun}-${num}`;
}

export function useTetherState(userId: string | null): TetherStateReturn {
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State machine: crisis mode forces minimalist UI + onboarding flag
  const uiConfig: UIConfig = profile?.is_crisis_mode ? 'minimalist' : 'full';

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      agentLog.architect(`Loading profile for userId: ${userId}`);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // No profile yet — bootstrap with random handle (minimal friction)
        const handle = generateRandomHandle();
        agentLog.architect(`No profile found. Bootstrapping with handle: ${handle}`);

        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert({ id: userId, random_handle: handle })
          .select()
          .single();

        if (!createError && created) {
          setProfile(created);
          agentLog.valkyrie(`Profile created: ${handle}. The Queen sees you. You're not alone.`);
        } else {
          agentLog.architect(`ERROR creating profile: ${createError?.message}`);
        }
      } else {
        // State machine: if crisis_mode is on but onboarding_pending isn't set, fix it
        if (data.is_crisis_mode && !data.onboarding_pending) {
          agentLog.architect(`Crisis mode detected. Enforcing onboarding_pending = TRUE.`);
          await supabase
            .from('profiles')
            .update({ onboarding_pending: true })
            .eq('id', userId);
          setProfile({ ...data, onboarding_pending: true });
        } else {
          setProfile(data);
        }
        agentLog.architect(
          `Profile loaded: ${data.random_handle} | crisis=${data.is_crisis_mode} | onboarding=${data.onboarding_pending}`
        );
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [userId]);

  const triggerCrisisMode = async () => {
    if (!userId) return;

    const handle = profile?.random_handle ?? generateRandomHandle();
    agentLog.architect(`SOS triggered. handle=${handle}`);

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, random_handle: handle, is_crisis_mode: true, onboarding_pending: true })
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      agentLog.valkyrie(`SOS received. Switching to minimalist mode. You are safe. Handle: ${data.random_handle}`);
    } else {
      agentLog.architect(`ERROR triggering crisis mode: ${error?.message}`);
    }
  };

  const exitCrisisMode = async () => {
    if (!userId || !profile) return;
    agentLog.architect(`Exiting crisis mode for ${profile.random_handle}`);

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_crisis_mode: false })
      .eq('id', userId)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      agentLog.valkyrie(`Crisis cleared. Full mode restored. The Queen welcomes you back.`);
    } else {
      agentLog.architect(`ERROR exiting crisis mode: ${error?.message}`);
    }
  };

  return { profile, uiConfig, isLoading, triggerCrisisMode, exitCrisisMode };
}
