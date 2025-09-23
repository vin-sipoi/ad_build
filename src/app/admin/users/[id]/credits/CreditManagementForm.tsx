'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { updateUserCredits } from '../../actions';
import { useRouter } from 'next/navigation';

interface CreditManagementFormProps {
  userId: string;
  currentCredits: number;
}

export function CreditManagementForm({ userId, currentCredits }: CreditManagementFormProps) {
  const router = useRouter();
  const [creditChange, setCreditChange] = useState<number>(0);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newBalance = Math.max(0, currentCredits + creditChange);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (creditChange === 0) {
      alert('Please enter a credit amount to add or remove.');
      return;
    }

    if (!note.trim()) {
      alert('Please provide a note explaining this credit change.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await updateUserCredits(userId, creditChange, note.trim());
      
      if (result.success && result.data) {
        alert(`Credits updated successfully! New balance: ${result.data.newCredits}`);
        setCreditChange(0);
        setNote('');
        router.refresh();
      } else {
        alert('Failed to update credits: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error updating credits: ' + String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="creditChange">Credit Change</Label>
            <Input
              id="creditChange"
              type="number"
              value={creditChange || ''}
              onChange={(e) => setCreditChange(parseInt(e.target.value) || 0)}
              placeholder="Enter positive or negative number"
              className="font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use positive numbers to add credits, negative to remove
            </p>
          </div>

          <div>
            <Label htmlFor="note">Note (Required)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain why you're adjusting this user's credits..."
              rows={3}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Preview</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Current Balance:</span>
                <Badge variant="outline">{currentCredits} credits</Badge>
              </div>
              <div className="flex justify-between">
                <span>Change:</span>
                <Badge variant={creditChange >= 0 ? "default" : "destructive"}>
                  {creditChange >= 0 ? '+' : ''}{creditChange} credits
                </Badge>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">New Balance:</span>
                <Badge variant="outline" className="font-semibold">
                  {newBalance} credits
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setCreditChange(10)}
              className="w-full"
            >
              +10 Credits (Lesson reward)
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setCreditChange(50)}
              className="w-full"
            >
              +50 Credits (Course completion)
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setCreditChange(100)}
              className="w-full"
            >
              +100 Credits (Bonus reward)
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={isSubmitting || creditChange === 0 || !note.trim()}
          className="flex-1"
        >
          {isSubmitting ? 'Updating Credits...' : 'Update Credits'}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => {
            setCreditChange(0);
            setNote('');
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
