import React, { useState } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';
import { useIOUM } from '../../context/IOUMContext';
import { Button } from '../common/Button';
import { PersonCard } from './PersonCard';

interface PersonListProps {
  onOpenNewPerson: () => void;
  onSelectPerson: (personId: string) => void;
}

export const PersonList: React.FC<PersonListProps> = ({
  onOpenNewPerson,
  onSelectPerson,
}) => {
  const { personSummaries, loadDemoData } = useIOUM();
  const [search, setSearch] = useState('');

  const filteredSummaries = personSummaries.filter((s) =>
    s.person.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.person.notes && s.person.notes.toLowerCase().includes(search.toLowerCase())) ||
    (s.person.phone && s.person.phone.includes(search))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            People &amp; Balances
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {personSummaries.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {personSummaries.length > 3 && (
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people..."
                className="w-full pl-8 pr-3 py-1.5 text-base sm:text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenNewPerson}
            icon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Add Person
          </Button>
        </div>
      </div>

      {filteredSummaries.length === 0 ? (
        <div className="text-center py-10 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500 mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {search ? 'No matching people found' : 'No people added yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {search
              ? 'Try adjusting your search query.'
              : 'Add your friends, roommates, or family members to begin tracking money lent or borrowed.'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="primary" size="sm" onClick={onOpenNewPerson} icon={<UserPlus className="w-3.5 h-3.5" />}>
              Add First Person
            </Button>
            {!search && (
              <Button variant="outline" size="sm" onClick={loadDemoData}>
                Load Demo Data
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSummaries.map((summary) => (
            <PersonCard
              key={summary.person.id}
              summary={summary}
              onSelect={onSelectPerson}
            />
          ))}
        </div>
      )}
    </div>
  );
};
