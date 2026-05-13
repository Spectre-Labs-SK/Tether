import { useCallback, useMemo, useState } from 'react';
import {
  supabase,
  type PlanActionType,
} from '../lib/supabase';
import { agentLog } from '../lib/agentLog';

export type JointFitnessMode = 'joint_ops' | 'ghost_ops';

export type FitnessQuestion = {
  id: 'energy' | 'time' | 'friction';
  prompt: string;
};

export type FitnessAnswer = {
  questionId: FitnessQuestion['id'];
  answer: string;
};

export type DraftFitnessAction = {
  title: string;
  detail: string;
  mode: JointFitnessMode;
  confidence: 'low' | 'medium';
  source: 'local_draft';
};

export type JointFitnessPlanState = {
  mode: JointFitnessMode;
  questions: FitnessQuestion[];
  answers: FitnessAnswer[];
  draftAction: DraftFitnessAction;
  pendingBehaviorEvents: number;
};

export type JointFitnessPlanReturn = {
  state: JointFitnessPlanState;
  setMode: (mode: JointFitnessMode) => void;
  answerQuestion: (questionId: FitnessQuestion['id'], answer: string) => Promise<void>;
  complete: () => Promise<void>;
  skip: () => Promise<void>;
  substitute: () => Promise<void>;
  shuffle: () => Promise<void>;
  defer: () => Promise<void>;
  correction: (note: string) => Promise<void>;
  partnerResponse: (response: 'accepted' | 'quiet' | 'deferred' | 'changed') => Promise<void>;
};

const QUESTIONS: FitnessQuestion[] = [
  { id: 'energy', prompt: 'What is your energy level right now?' },
  { id: 'time', prompt: 'How many honest minutes do you have?' },
  { id: 'friction', prompt: 'What would make this easiest to start?' },
];

function buildDraft(mode: JointFitnessMode, answers: FitnessAnswer[]): DraftFitnessAction {
  const timeAnswer = answers.find(answer => answer.questionId === 'time')?.answer;
  const energyAnswer = answers.find(answer => answer.questionId === 'energy')?.answer;
  const minutes = Number.parseInt(timeAnswer ?? '', 10);
  const shortWindow = Number.isFinite(minutes) && minutes > 0 && minutes <= 8;
  const lowEnergy = energyAnswer?.toLowerCase().includes('low') ?? false;

  if (shortWindow || lowEnergy) {
    return {
      title: mode === 'joint_ops' ? 'Two-person reset set' : 'Ghost Ops reset set',
      detail: 'One tiny set each: squat to chair, wall push, or walk the room. Change it honestly.',
      mode,
      confidence: 'medium',
      source: 'local_draft',
    };
  }

  return {
    title: mode === 'joint_ops' ? 'Joint Ops movement breach' : 'Ghost Ops quiet movement',
    detail: 'Start with one shared movement action. Complete it, shrink it, swap it, or defer it.',
    mode,
    confidence: answers.length >= 2 ? 'medium' : 'low',
    source: 'local_draft',
  };
}

export function useJointFitnessPlan(userId: string | null): JointFitnessPlanReturn {
  const [mode, setMode] = useState<JointFitnessMode>('joint_ops');
  const [answers, setAnswers] = useState<FitnessAnswer[]>([]);
  const [pendingBehaviorEvents, setPendingBehaviorEvents] = useState(0);

  const draftAction = useMemo(() => buildDraft(mode, answers), [answers, mode]);

  const logPlanAction = useCallback(async (
    actionType: PlanActionType,
    metadata: Record<string, unknown> = {},
  ): Promise<void> => {
    if (!userId) {
      setPendingBehaviorEvents(prev => prev + 1);
      agentLog.architect(`Queued joint fitness behavior without userId: ${actionType}`);
      return;
    }

    const { data: plan, error: planError } = await supabase
      .from('generated_plans')
      .insert({
        profile_id: userId,
        source: 'local_draft',
        title: draftAction.title,
        mode,
        status: actionType === 'defer' ? 'deferred' : 'active',
        draft_context: { answers, confidence: draftAction.confidence },
      })
      .select('id')
      .single();

    if (planError || !plan) {
      agentLog.architect(`ERROR creating generated fitness plan: ${planError?.message}`);
      setPendingBehaviorEvents(prev => prev + 1);
      return;
    }

    const { data: step, error: stepError } = await supabase
      .from('plan_steps')
      .insert({
        plan_id: plan.id,
        step_order: 1,
        domain: 'fitness',
        title: draftAction.title,
        instructions: draftAction.detail,
        status: actionType === 'complete' ? 'complete' : 'pending',
        alternate: { type: 'substitute', label: 'Shrink or swap the movement' },
      })
      .select('id')
      .single();

    if (stepError || !step) {
      agentLog.architect(`ERROR creating fitness plan step: ${stepError?.message}`);
      setPendingBehaviorEvents(prev => prev + 1);
      return;
    }

    const { error: actionError } = await supabase.from('plan_actions').insert({
      plan_id: plan.id,
      step_id: step.id,
      profile_id: userId,
      action_type: actionType,
      metadata: { ...metadata, mode },
    });

    if (actionError) {
      agentLog.architect(`ERROR logging fitness plan action: ${actionError.message}`);
      setPendingBehaviorEvents(prev => prev + 1);
    }
  }, [answers, draftAction.confidence, draftAction.detail, draftAction.title, mode, userId]);

  const answerQuestion = useCallback(async (
    questionId: FitnessQuestion['id'],
    answer: string,
  ): Promise<void> => {
    setAnswers(prev => {
      const next = prev.filter(item => item.questionId !== questionId);
      return [...next, { questionId, answer }].slice(0, 3);
    });

    if (!userId) return;

    const nextAnswers = [
      ...answers.filter(item => item.questionId !== questionId),
      { questionId, answer },
    ].slice(0, 3);

    const { error } = await supabase.from('question_sessions').insert({
      profile_id: userId,
      purpose: 'joint_fitness_level_0',
      questions: QUESTIONS.slice(0, 3),
      answers: nextAnswers,
      question_count: nextAnswers.length,
      status: nextAnswers.length > 0 ? 'answered' : 'drafting',
    });

    if (error) {
      agentLog.architect(`ERROR logging fitness question session: ${error.message}`);
      setPendingBehaviorEvents(prev => prev + 1);
    }
  }, [answers, userId]);

  return {
    state: {
      mode,
      questions: QUESTIONS,
      answers,
      draftAction,
      pendingBehaviorEvents,
    },
    setMode,
    answerQuestion,
    complete: () => logPlanAction('complete'),
    skip: () => logPlanAction('skip'),
    substitute: () => logPlanAction('substitute', { replacement: 'smaller_or_swapped_action' }),
    shuffle: () => logPlanAction('shuffle', { order_changed: true }),
    defer: () => logPlanAction('defer', { timing_signal: 'later' }),
    correction: (note: string) => logPlanAction('correction', { note }),
    partnerResponse: (response: 'accepted' | 'quiet' | 'deferred' | 'changed') => (
      logPlanAction('partner_response', { response })
    ),
  };
}
