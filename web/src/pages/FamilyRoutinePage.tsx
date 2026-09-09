import React, { useState, useEffect } from 'react';
import { routineApi } from '../api/routineApi';
import { FamilyRoutine, TodayHadith } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { HeartHandshake, Plus, BookOpen, Sun, Moon, Sparkles } from 'lucide-react';

export const FamilyRoutinePage: React.FC = () => {
  const [routines, setRoutines] = useState<FamilyRoutine[]>([]);
  const [hadith, setHadith] = useState<TodayHadith | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add Routine Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'bedtime'>('morning');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedRoutines, fetchedHadith] = await Promise.all([
        routineApi.getRoutines(),
        routineApi.getTodayHadith(),
      ]);
      setRoutines(fetchedRoutines);
      setHadith(fetchedHadith);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await routineApi.createRoutine({
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        timeOfDay,
      });
      setRoutines((prev) => [...prev, created]);
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create routine.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading Family Routines & Hadith..." />;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Family Routines & Values</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Establish positive daily household routines and share Hadith reflections with your family
          </p>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          Add Routine Item
        </Button>
      </div>

      {/* Hadith of the Day Banner */}
      {hadith && (
        <div className="bg-gradient-to-br from-teal-500/10 via-white to-slate-50 border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-2xs">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" /> Hadith Reflection of the Day
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{hadith.title}</h3>
          <blockquote className="text-sm italic text-slate-700 bg-slate-50 border-l-4 border-teal-500 p-4 rounded-r-xl my-3">
            "{hadith.text}"
          </blockquote>
          <div className="flex items-center justify-between text-xs text-slate-600 mt-3">
            <span className="font-semibold text-teal-700">Source: {hadith.source}</span>
            <span className="text-slate-500">{hadith.reflection}</span>
          </div>
        </div>
      )}

      {/* Routines List */}
      <Card title="Household Daily Routines">
        {routines.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No routines defined yet. Tap "Add Routine Item" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routines.map((r) => (
              <div key={r.id || r._id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{r.title}</span>
                  <Badge variant="info" size="sm">
                    {r.timeOfDay.toUpperCase()}
                  </Badge>
                </div>
                {r.description && <p className="text-slate-600">{r.description}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Routine Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Family Routine Item">
        <form onSubmit={handleCreateRoutine} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Prayer & Quran Reading"
              className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Time of Day *</label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as typeof timeOfDay)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="bedtime">Bedtime</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes or goals for this routine item..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save Routine
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
