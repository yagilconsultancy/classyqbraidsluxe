import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Loader2, Shield, User as UserIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AdminTeam() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [inviting, setInviting] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(email.trim(), role);
      toast({ title: 'Invitation sent', description: `${email.trim()} has been invited as ${role}.` });
      setEmail('');
      setRole('admin');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Invitation failed', description: err.message || 'Could not send invite.' });
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-gold" />
            Add Team Member
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Invite a new team member. They'll receive an email to set a password and access the admin panel.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="teammate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="invite-role" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — full access to manage everything</SelectItem>
                  <SelectItem value="user">User — limited access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="h-11 font-medium" disabled={inviting}>
              {inviting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending invite...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4">Loading team members...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No team members found.</p>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-sm">
                  <div className="flex items-center gap-3">
                    {u.role === 'admin' ? (
                      <Shield className="w-4 h-4 text-gold" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{u.full_name || u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-sm uppercase tracking-wider font-medium ${
                    u.role === 'admin' ? 'bg-gold/10 text-gold' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}