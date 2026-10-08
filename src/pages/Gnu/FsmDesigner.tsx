import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

const DESIGNER_URL = '/tools/fsm-designer/index.html';

const TIPS = [
  { action: 'Double-click empty space', result: 'Add a state' },
  { action: 'Double-click a state', result: 'Toggle accepting state' },
  { action: 'Shift + drag', result: 'Add a transition' },
  { action: 'Click', result: 'Select, then type to label' },
  { action: 'Drag', result: 'Move a state or bend a transition' },
  { action: 'Delete (Fn + Delete on macOS)', result: 'Remove the selected item' },
];

export default function FsmDesigner() {
  useEffect(() => {
    document.title = 'FSM Designer | Nafees Mansoor';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Draw finite state machines in the browser: DFA, NFA, PDA, and Turing machine diagrams with PNG, SVG, and LaTeX export.');
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">FSM Designer</h1>
            <p className="text-gray-500 max-w-2xl">
              A drawing board for finite state machines. Sketch deterministic (DFA), non-deterministic (NFA),
              pushdown (PDA), and Turing machine diagrams, then export them as PNG, SVG, or LaTeX. Drawings are
              saved in your browser.
            </p>
          </div>
          <a
            href={DESIGNER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 group flex items-center space-x-2 shrink-0 self-start md:self-auto"
          >
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Open full screen</span>
          </a>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIPS.map((tip) => (
            <li key={tip.action} className="p-5 bg-zinc-900/50 border border-white/5 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-400/80">{tip.action}</div>
              <div className="text-sm text-gray-400 mt-1">{tip.result}</div>
            </li>
          ))}
        </ul>

        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden">
          <iframe
            src={DESIGNER_URL}
            title="FSM Designer drawing board"
            className="w-full h-[760px] block"
          />
        </div>

        <p className="text-xs text-gray-600">
          Free software, released under the MIT License. Based on the Finite State Machine Designer by Evan Wallace.
        </p>
      </motion.div>
    </div>
  );
}
