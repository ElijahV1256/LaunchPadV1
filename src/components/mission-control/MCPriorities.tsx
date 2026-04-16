import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, ListChecks } from 'lucide-react';
import { PLACEHOLDER_PRIORITIES } from '../../data/mission-control';

interface Priority {
  id: string;
  title: string;
  completed: boolean;
}

interface Props {
  priorities: Priority[];
  onToggle: (id: string) => void;
  onAdd: (title: string) => void;
}

export default function MCPriorities({ priorities, onToggle, onAdd }: Props) {
  const [newTask, setNewTask] = useState('');
  const [showInput, setShowInput] = useState(false);

  const displayItems = priorities.length > 0
    ? priorities
    : PLACEHOLDER_PRIORITIES.map((title, i) => ({
        id: `placeholder-${i}`,
        title,
        completed: false,
      }));

  const isPlaceholder = priorities.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    onAdd(newTask.trim());
    setNewTask('');
    setShowInput(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
            <ListChecks size={16} className="text-[#F59E0B]" />
          </div>
          <h2 className="text-white font-bold text-base">Today's Priorities</h2>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.04]"
        >
          <Plus size={13} />
          Add
        </button>
      </div>

      <AnimatePresence>
        {showInput && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-4 overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What's your priority?"
                autoFocus
                className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-[#2979FF]/30"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#2979FF] text-white rounded-lg text-sm font-semibold hover:bg-[#2979FF]/80 transition-colors"
              >
                Add
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {displayItems.map((item) => (
          <motion.button
            key={item.id}
            layout
            onClick={() => !isPlaceholder && onToggle(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
              item.completed
                ? 'bg-emerald-500/[0.06] border border-emerald-500/10'
                : 'bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08]'
            } ${isPlaceholder ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
          >
            <motion.div
              animate={item.completed ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {item.completed ? (
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle size={18} className="text-gray-600 flex-shrink-0" />
              )}
            </motion.div>
            <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
              {item.title}
            </span>
          </motion.button>
        ))}
      </div>

      {isPlaceholder && (
        <p className="text-gray-600 text-xs mt-3 text-center">
          These are examples. Add your own priorities above.
        </p>
      )}
    </motion.div>
  );
}
