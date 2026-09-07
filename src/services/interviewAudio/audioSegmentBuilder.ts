import { InterviewQuestionItem } from '../../types/challenge';
import { AudioSegment } from '../../types/interviewAudio';

/**
 * Phonetically normalizes technical React terms, code symbols, and acronyms
 * so browser SpeechSynthesis sounds natural, intelligible, and professional.
 */
export function normalizeTextForSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // Remove markdown code fences and backticks
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    // Convert code blocks into conversational explanations
    const cleanLines = match
      .replace(/```[a-z]*\n?/gi, '')
      .replace(/```/g, '')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('//'))
      .slice(0, 4) // Don't speak overly long code blocks line by line
      .join(', ');
    return cleanLines ? `for example: ${cleanLines}` : '';
  });

  text = text.replace(/`([^`]+)`/g, '$1');

  // Phonetic expansions for math & complexity
  text = text.replace(/O\(n\^3\)/gi, 'O of N cubed');
  text = text.replace(/O\(n\^2\)/gi, 'O of N squared');
  text = text.replace(/O\(n\s*log\s*n\)/gi, 'O of N log N');
  text = text.replace(/O\(n\)/gi, 'O of N');
  text = text.replace(/O\(1\)/gi, 'O of 1');
  text = text.replace(/10\^9/g, '1 billion');

  // Common web acronyms (spelled out with hyphens so TTS engines spell them clearly)
  text = text.replace(/\bDOM\b/g, 'D-O-M');
  text = text.replace(/\bVDOM\b/g, 'virtual D-O-M');
  text = text.replace(/\bJSX\b/g, 'J-S-X');
  text = text.replace(/\bAPI\b/g, 'A-P-I');
  text = text.replace(/\bAPIs\b/g, 'A-P-Is');
  text = text.replace(/\bUI\b/g, 'U-I');
  text = text.replace(/\bSSR\b/g, 'S-S-R');
  text = text.replace(/\bCSR\b/g, 'C-S-R');
  text = text.replace(/\bSSG\b/g, 'S-S-G');
  text = text.replace(/\bRSC\b/g, 'React Server Components');
  text = text.replace(/\bHTML\b/g, 'H-T-M-L');
  text = text.replace(/\bCSS\b/g, 'C-S-S');
  text = text.replace(/\bURL\b/g, 'U-R-L');
  text = text.replace(/\bHTTP\b/g, 'H-T-T-P');
  text = text.replace(/\bINP\b/g, 'I-N-P, Interaction to Next Paint');
  text = text.replace(/\bLCP\b/g, 'L-C-P, Largest Contentful Paint');
  text = text.replace(/\bCLS\b/g, 'C-L-S, Cumulative Layout Shift');
  text = text.replace(/\bFID\b/g, 'F-I-D, First Input Delay');
  text = text.replace(/\bFPS\b/g, 'frames per second');
  text = text.replace(/\b60fps\b/gi, '60 frames per second');
  text = text.replace(/\b120fps\b/gi, '120 frames per second');

  // React-specific function names and identifiers
  text = text.replace(/\buseState\b/g, 'use State');
  text = text.replace(/\buseEffect\b/g, 'use Effect');
  text = text.replace(/\buseLayoutEffect\b/g, 'use Layout Effect');
  text = text.replace(/\buseMemo\b/g, 'use Memo');
  text = text.replace(/\buseCallback\b/g, 'use Callback');
  text = text.replace(/\buseRef\b/g, 'use Ref');
  text = text.replace(/\buseReducer\b/g, 'use Reducer');
  text = text.replace(/\buseContext\b/g, 'use Context');
  text = text.replace(/\buseTransition\b/g, 'use Transition');
  text = text.replace(/\buseDeferredValue\b/g, 'use Deferred Value');
  text = text.replace(/\buseSyncExternalStore\b/g, 'use Sync External Store');
  text = text.replace(/\buseId\b/g, 'use Id');
  text = text.replace(/\buseImperativeHandle\b/g, 'use Imperative Handle');
  text = text.replace(/\bstartTransition\b/g, 'start Transition');
  text = text.replace(/\bflushSync\b/g, 'flush Sync');
  text = text.replace(/\bcreateRoot\b/g, 'create Root');
  text = text.replace(/\bsetState\b/g, 'set State');
  text = text.replace(/\bbeginWork\b/g, 'begin Work');
  text = text.replace(/\bcompleteWork\b/g, 'complete Work');
  text = text.replace(/\bcommitRoot\b/g, 'commit Root');
  text = text.replace(/\bworkInProgress\b/g, 'work In Progress');
  text = text.replace(/\bFiberRoot\b/g, 'Fiber Root');
  text = text.replace(/\bmemoizedState\b/g, 'memoized State');
  text = text.replace(/\bmemoizedProps\b/g, 'memoized Props');
  text = text.replace(/\bpendingProps\b/g, 'pending Props');
  text = text.replace(/\bupdateQueue\b/g, 'update Queue');
  text = text.replace(/\bSubtreeFlags\b/g, 'Subtree Flags');
  text = text.replace(/\bReact\.memo\b/g, 'React dot memo');
  text = text.replace(/\bReactDOM\.createRoot\b/g, 'React D-O-M dot create Root');
  text = text.replace(/\bObject\.is\b/g, 'Object dot is');

  // Strip ASCII diagram box characters so TTS does not attempt to read them
  text = text.replace(/[┌┐└┘├┤─│═║╔╗╚╝╠╣▼▲►◄──►]/g, ' ');

  // Clean markdown bullets, hashes, bold/italic markers
  text = text.replace(/^#+\s+/gm, '');
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');
  text = text.replace(/^[•\-*]\s+/gm, '');

  // Normalize multi-spaces and trim
  text = text.replace(/\s{2,}/g, ' ').trim();

  return text;
}

/**
 * Builds speech text with natural human mentor cadences, using punctuation
 * (ellipses and em-dashes) to guide browser TTS engines into natural vocal pauses.
 */
export function formatMentorSpeech(intro: string, body: string): string {
  const cleanBody = normalizeTextForSpeech(body);
  if (!cleanBody) return '';
  return `${intro}... ${cleanBody}`;
}

/**
 * Splits a question into distinct sequential audio segments with target element anchors.
 */
export function buildQuestionAudioSegments(
  question: InterviewQuestionItem,
  questionIndex: number
): AudioSegment[] {
  const segments: AudioSegment[] = [];
  const qNum = questionIndex + 1;
  const qId = question.id;

  // 1. Question Title Segment
  segments.push({
    id: `${qId}-question`,
    questionId: qId,
    questionNumber: qNum,
    type: 'question',
    label: `Question #${qNum}`,
    text: question.question,
    speechText: `Question ${qNum}... ${normalizeTextForSpeech(question.question)}`,
    targetElementId: `interview-q-${qId}`,
  });

  // 2. Executive Summary Segment
  if (question.shortAnswer) {
    segments.push({
      id: `${qId}-summary`,
      questionId: qId,
      questionNumber: qNum,
      type: 'summary',
      label: 'Executive Summary',
      text: question.shortAnswer,
      speechText: formatMentorSpeech(
        "Here is the executive summary",
        question.shortAnswer
      ),
      targetElementId: `interview-summary-${qId}`,
    });
  }

  // 3. Architectural Deep Dive Segment
  if (question.deepDive) {
    segments.push({
      id: `${qId}-deep-dive`,
      questionId: qId,
      questionNumber: qNum,
      type: 'deep-dive',
      label: 'Architectural Deep Dive',
      text: question.deepDive,
      speechText: formatMentorSpeech(
        "Now, let's explore the architectural deep dive and internals",
        question.deepDive
      ),
      targetElementId: `interview-deep-dive-${qId}`,
    });
  }

  // 4. Common Pitfalls & Traps (if present)
  if (question.commonPitfalls && question.commonPitfalls.length > 0) {
    const pitfallText = question.commonPitfalls.join(' ');
    segments.push({
      id: `${qId}-pitfall`,
      questionId: qId,
      questionNumber: qNum,
      type: 'pitfall',
      label: 'Candidate Trap & Pitfall',
      text: pitfallText,
      speechText: formatMentorSpeech(
        "Here is a critical pitfall where senior candidates often get tripped up",
        pitfallText
      ),
      targetElementId: `interview-pitfall-${qId}`,
    });
  }

  // 5. Follow-Up Question & Answer (if present)
  if (question.followUp) {
    const followUpSpeech = question.followUp.answer
      ? `In an interview, the interviewer may follow up with this probe: "${normalizeTextForSpeech(
          question.followUp.question
        )}"... A strong senior response is: ${normalizeTextForSpeech(
          question.followUp.answer
        )}`
      : `In an interview, the interviewer may follow up with this probe: "${normalizeTextForSpeech(
          question.followUp.question
        )}"`;

    segments.push({
      id: `${qId}-follow-up`,
      questionId: qId,
      questionNumber: qNum,
      type: 'follow-up',
      label: 'Interviewer Follow-Up Probe',
      text: `Probe: "${question.followUp.question}"\n\nModel Response: ${question.followUp.answer || ''}`,
      speechText: followUpSpeech,
      targetElementId: `interview-followup-${qId}`,
    });
  }

  // 6. Mental Model Segment (if present - Know More section)
  if (question.mentalModel) {
    segments.push({
      id: `${qId}-mental-model`,
      questionId: qId,
      questionNumber: qNum,
      type: 'mental-model',
      label: 'Mental Model & Flow',
      text: question.mentalModel,
      speechText: formatMentorSpeech(
        "To build a clear mental model, visualize this flow",
        question.mentalModel
      ),
      targetElementId: `interview-mental-model-${qId}`,
    });
  }

  // 7. Step-by-Step Breakdown (if present - Know More section)
  if (question.stepByStep && question.stepByStep.length > 0) {
    question.stepByStep.forEach((step, idx) => {
      segments.push({
        id: `${qId}-step-${idx}`,
        questionId: qId,
        questionNumber: qNum,
        type: 'step',
        label: `Step ${idx + 1}`,
        text: step,
        speechText: normalizeTextForSpeech(step),
        targetElementId: `interview-step-${qId}-${idx}`,
      });
    });
  }

  // 8. Practical Example (if present - Know More section)
  if (question.practicalExample) {
    segments.push({
      id: `${qId}-example`,
      questionId: qId,
      questionNumber: qNum,
      type: 'example',
      label: 'Production Practical Example',
      text: question.practicalExample,
      speechText: formatMentorSpeech(
        "In a real-world production architecture",
        question.practicalExample
      ),
      targetElementId: `interview-example-${qId}`,
    });
  }

  // 9. Misconceptions (if present - Know More section)
  if (question.misconceptions && question.misconceptions.length > 0) {
    const miscText = question.misconceptions.join(' ');
    segments.push({
      id: `${qId}-misconception`,
      questionId: qId,
      questionNumber: qNum,
      type: 'misconception',
      label: 'Common Misconceptions',
      text: miscText,
      speechText: formatMentorSpeech(
        "Let's clarify common misconceptions surrounding this topic",
        miscText
      ),
      targetElementId: `interview-misconceptions-${qId}`,
    });
  }

  // 10. Interview Insight (if present - Know More section)
  if (question.interviewInsight) {
    segments.push({
      id: `${qId}-insight`,
      questionId: qId,
      questionNumber: qNum,
      type: 'insight',
      label: 'Senior Interview Insight',
      text: question.interviewInsight,
      speechText: formatMentorSpeech(
        "Here is an insider interview insight on how to deliver this answer",
        question.interviewInsight
      ),
      targetElementId: `interview-insight-${qId}`,
    });
  }

  return segments;
}

/**
 * Builds the complete flattened audio playback queue for an array of interview questions.
 */
export function buildAudioQueueForQuestions(
  questions: InterviewQuestionItem[]
): AudioSegment[] {
  const fullQueue: AudioSegment[] = [];
  questions.forEach((q, idx) => {
    const qSegments = buildQuestionAudioSegments(q, idx);
    fullQueue.push(...qSegments);
  });
  return fullQueue;
}
