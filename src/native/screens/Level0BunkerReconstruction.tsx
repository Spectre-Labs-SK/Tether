import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useJointFitnessPlan } from '../../hooks/useJointFitnessPlan';
import { useLevel0Bunker, type Level0BunkerMode } from '../../hooks/useLevel0Bunker';

const COLORS = {
  militaryBg: '#101713',
  militaryPanel: '#18231d',
  militaryAccent: '#8fbf66',
  etherBg: '#171127',
  etherPanel: '#221a35',
  etherAccent: '#b79bff',
  mixedBg: '#121715',
  mixedPanel: '#1b2421',
  mixedAccent: '#9fd0c2',
  danger: '#f59e0b',
  text: '#f8fafc',
  muted: '#a8b3c7',
  border: 'rgba(248, 250, 252, 0.16)',
};

const MODE_LABELS: Record<Level0BunkerMode, string> = {
  MILITARY: 'Military',
  ETHER: 'Ethereal',
  MIXED: 'Mixed',
};

function paletteFor(mode: Level0BunkerMode) {
  if (mode === 'MILITARY') {
    return {
      bg: COLORS.militaryBg,
      panel: COLORS.militaryPanel,
      accent: COLORS.militaryAccent,
    };
  }

  if (mode === 'ETHER') {
    return {
      bg: COLORS.etherBg,
      panel: COLORS.etherPanel,
      accent: COLORS.etherAccent,
    };
  }

  return {
    bg: COLORS.mixedBg,
    panel: COLORS.mixedPanel,
    accent: COLORS.mixedAccent,
  };
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'quiet';
  accent: string;
};

function ActionButton({ label, onPress, tone = 'quiet', accent }: ActionButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.actionButton,
        tone === 'primary' ? { backgroundColor: accent } : { borderColor: COLORS.border },
      ]}
    >
      <Text style={[styles.actionText, tone === 'primary' ? styles.primaryActionText : null]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function Level0BunkerReconstruction() {
  const bunker = useLevel0Bunker(null);
  const fitness = useJointFitnessPlan(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const palette = paletteFor(bunker.state.mode);
  const currentQuestion = fitness.state.questions[questionIndex];
  const repairedCount = bunker.state.repairedSections.length;
  const doorReady = bunker.state.lockedDoorProgress >= 100;

  const answerQuestion = (answer: string) => {
    void fitness.answerQuestion(currentQuestion.id, answer);
    setQuestionIndex(prev => Math.min(prev + 1, fitness.state.questions.length - 1));
  };

  const completeFitness = () => {
    void fitness.complete();
    void bunker.completeAction();
  };

  const substituteFitness = () => {
    void fitness.substitute();
    void bunker.substituteAction();
  };

  const skipFitness = () => {
    void fitness.skip();
    void bunker.skipAction();
  };

  const shuffleFitness = () => {
    void fitness.shuffle();
    void bunker.shuffleAction();
  };

  const deferFitness = () => {
    void fitness.defer();
    void bunker.deferAction();
  };

  const correctFitness = () => {
    void fitness.correction('Phase 0 correction from Bunker screen');
    void bunker.recordCorrection('Phase 0 correction from Bunker screen');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.kicker}>LEVEL 0</Text>
            <Text style={styles.title}>Bunker Reconstruction</Text>
          </View>
          <Text style={[styles.statusPill, { borderColor: palette.accent, color: palette.accent }]}>
            {MODE_LABELS[bunker.state.mode]}
          </Text>
        </View>

        <View style={styles.modeRow}>
          {(['MILITARY', 'ETHER', 'MIXED'] as Level0BunkerMode[]).map(mode => (
            <TouchableOpacity
              accessibilityRole="button"
              key={mode}
              onPress={() => bunker.setMode(mode)}
              style={[
                styles.modeButton,
                bunker.state.mode === mode ? { backgroundColor: palette.accent } : null,
              ]}
            >
              <Text style={[
                styles.modeText,
                bunker.state.mode === mode ? styles.selectedModeText : null,
              ]}
              >
                {MODE_LABELS[mode]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.bunkerPanel, { backgroundColor: palette.panel }]}>
          <View style={styles.sceneRow}>
            <View style={styles.sceneBlock}>
              <Text style={styles.sceneLabel}>Base integrity</Text>
              <View style={styles.integrityTrack}>
                <View
                  style={[
                    styles.integrityFill,
                    {
                      backgroundColor: palette.accent,
                      width: `${100 - bunker.state.degradationLevel}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.sceneValue}>
                {100 - bunker.state.degradationLevel}% restored
              </Text>
            </View>

            <View style={styles.sceneBlock}>
              <Text style={styles.sceneLabel}>Sections online</Text>
              <Text style={[styles.bigNumber, { color: palette.accent }]}>{repairedCount}/3</Text>
            </View>
          </View>

          <View style={styles.baseMap}>
            <View style={[styles.room, repairedCount > 0 ? { borderColor: palette.accent } : null]}>
              <Text style={styles.roomTitle}>Training corner</Text>
              <Text style={styles.roomMeta}>{repairedCount > 0 ? 'stabilized' : 'sparking'}</Text>
            </View>
            <View style={[styles.room, bunker.state.lockedDoorProgress > 50 ? { borderColor: palette.accent } : null]}>
              <Text style={styles.roomTitle}>{doorReady ? 'Door ready' : 'Locked door'}</Text>
              <Text style={styles.roomMeta}>{bunker.state.lockedDoorProgress}% decoded</Text>
            </View>
            <View style={[styles.room, bunker.state.intelDrop.earned ? { borderColor: palette.accent } : null]}>
              <Text style={styles.roomTitle}>{bunker.state.intelDrop.label}</Text>
              <Text style={styles.roomMeta}>{bunker.state.intelDrop.earned ? 'tap to open' : 'not recovered'}</Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            disabled={!bunker.state.intelDrop.earned}
            onPress={bunker.openIntelDrop}
            style={[styles.intelDrop, bunker.state.intelDrop.earned ? { borderColor: palette.accent } : null]}
          >
            <Text style={styles.intelLabel}>{bunker.state.intelDrop.label}</Text>
            <Text style={styles.intelText}>
              {bunker.state.intelDrop.opened
                ? 'Pattern found: smaller actions still repair the base.'
                : 'Recover one honest action to decrypt.'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.panel, { backgroundColor: palette.panel }]}>
          <Text style={styles.panelTitle}>{bunker.state.activeChaosEvent.title}</Text>
          <Text style={styles.bodyText}>{bunker.state.activeChaosEvent.detail}</Text>
          <View style={styles.actionGrid}>
            <ActionButton
              accent={palette.accent}
              label="Defend"
              onPress={() => { void bunker.respondToChaos('defended'); }}
              tone="primary"
            />
            <ActionButton
              accent={palette.accent}
              label="Defer"
              onPress={() => { void bunker.respondToChaos('deferred'); }}
            />
          </View>
        </View>

        <View style={[styles.panel, { backgroundColor: palette.panel }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.kicker}>JOINT OPS / GHOST OPS</Text>
              <Text style={styles.panelTitle}>{fitness.state.draftAction.title}</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => fitness.setMode(
                fitness.state.mode === 'joint_ops' ? 'ghost_ops' : 'joint_ops',
              )}
              style={[styles.modeToggle, { borderColor: palette.accent }]}
            >
              <Text style={[styles.modeToggleText, { color: palette.accent }]}>
                {fitness.state.mode === 'joint_ops' ? 'Joint' : 'Ghost'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bodyText}>{fitness.state.draftAction.detail}</Text>

          <View style={styles.questionBox}>
            <Text style={styles.sceneLabel}>Question {questionIndex + 1}/3</Text>
            <Text style={styles.questionText}>{currentQuestion.prompt}</Text>
            <View style={styles.answerRow}>
              <ActionButton accent={palette.accent} label="Low / tiny" onPress={() => answerQuestion('low')} />
              <ActionButton accent={palette.accent} label="Good / now" onPress={() => answerQuestion('good')} />
              <ActionButton accent={palette.accent} label="Later" onPress={() => answerQuestion('later')} />
            </View>
          </View>

          <View style={styles.actionGrid}>
            <ActionButton accent={palette.accent} label="Complete" onPress={completeFitness} tone="primary" />
            <ActionButton accent={palette.accent} label="Skip" onPress={skipFitness} />
            <ActionButton accent={palette.accent} label="Substitute" onPress={substituteFitness} />
            <ActionButton accent={palette.accent} label="Shuffle" onPress={shuffleFitness} />
            <ActionButton accent={palette.accent} label="Defer" onPress={deferFitness} />
            <ActionButton accent={palette.accent} label="Correction" onPress={correctFitness} />
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => { void fitness.partnerResponse('quiet'); }}
            style={styles.ghostButton}
          >
            <Text style={styles.ghostText}>Ghost Ops quiet check-in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 32,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  kicker: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 7,
    textTransform: 'uppercase',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  modeText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  selectedModeText: {
    color: '#0f172a',
  },
  bunkerPanel: {
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  panel: {
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sceneRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sceneBlock: {
    flex: 1,
  },
  sceneLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sceneValue: {
    color: COLORS.text,
    fontSize: 13,
    marginTop: 6,
  },
  integrityTrack: {
    backgroundColor: 'rgba(248, 250, 252, 0.12)',
    borderRadius: 999,
    height: 12,
    marginTop: 10,
    overflow: 'hidden',
  },
  integrityFill: {
    height: '100%',
  },
  bigNumber: {
    fontSize: 36,
    fontWeight: '900',
    marginTop: 4,
  },
  baseMap: {
    gap: 10,
  },
  room: {
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  roomTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  roomMeta: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
  intelDrop: {
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  intelLabel: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '900',
  },
  intelText: {
    color: COLORS.text,
    fontSize: 14,
    marginTop: 6,
  },
  panelTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
  bodyText: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    borderRadius: 8,
    borderWidth: 1,
    minWidth: '30%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  primaryActionText: {
    color: '#0f172a',
  },
  modeToggle: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modeToggleText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  questionBox: {
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  questionText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ghostButton: {
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  ghostText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
});
