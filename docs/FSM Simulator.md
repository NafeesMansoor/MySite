**Task: Upgrade the existing FSM Designer into an interactive DFA/NFA Simulator**

Review the complete codebase for https://www.nafees.info/gnu-projects/fsm-designer and extend the existing application with a working finite-state machine simulator.

**Core requirements**

1. Preserve all existing drawing, editing, state/transition configuration, and PNG, SVG, and LaTeX export functionality.
2. Add an input-string field and an Execute button to the existing interface.
3. Implement correct DFA and NFA execution using the actual machine data created in the editor. Do not build a separate hardcoded machine or duplicate the diagram in the simulator.
4. Animate execution symbol by symbol, highlighting the current state, traversed transition, consumed input, and remaining input.
5. For NFAs, track all reachable states and computation branches correctly. Support epsilon transitions if they are part of the existing transition model.
6. Add Play, Pause, Next Step, Previous Step, Reset, and adjustable playback speed.
7. Display a detailed execution trace and a final Accepted or Rejected result, including an explanation of the outcome.
8. Handle empty input, missing transitions, invalid input symbols, missing start states, and malformed machine configurations gracefully.
9. Keep the interface clean, modern, responsive, and suitable for teaching automata theory. Ensure animations remain readable and do not interfere with drawing or editing.
10. Add automated tests for DFA/NFA execution, nondeterministic branching, accepting and rejecting inputs, epsilon transitions where applicable, and edge cases.

**Implementation approach**

First inspect the repository, identify its framework, machine data model, rendering engine, and existing transition semantics. Then implement the smallest robust extension that integrates with the current architecture. Keep simulation logic separate from presentation logic and make execution steps reversible.

Do not replace the existing application with a new standalone implementation. Do not break existing features or export formats. Do not claim completion until the application builds, the tests pass, and the actual end-to-end simulation works.

Finish by summarizing the changes, files modified, tests performed, and any remaining limitations.