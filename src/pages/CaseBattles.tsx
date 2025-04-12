
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CaseBattle } from '@/types';
import { useUser } from '@/context/UserContext';
import { Plus, Users, Timer, Gem } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from '@/components/ui/sonner';

const CaseBattles: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [battles, setBattles] = useState<CaseBattle[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBattle, setNewBattle] = useState({
    name: '',
    price: 100,
    casesToOpen: 3,
    maxPlayers: 2
  });

  useEffect(() => {
    // Mock data - in real app this would be API fetch
    const mockBattles: CaseBattle[] = [
      {
        id: '1',
        name: 'Gems Galore',
        price: 500,
        casesToOpen: 5,
        maxPlayers: 2,
        currentPlayers: 0,
        status: 'waiting'
      },
      {
        id: '2',
        name: 'High Rollers',
        price: 1000,
        casesToOpen: 3,
        maxPlayers: 4,
        currentPlayers: 2,
        status: 'waiting'
      },
      {
        id: '3',
        name: 'Budget Battle',
        price: 200,
        casesToOpen: 2,
        maxPlayers: 2,
        currentPlayers: 1,
        status: 'waiting'
      },
      {
        id: '4',
        name: 'Gem Hunters',
        price: 750,
        casesToOpen: 4,
        maxPlayers: 3,
        currentPlayers: 0,
        status: 'waiting'
      }
    ];
    
    setBattles(mockBattles);
  }, []);

  const handleCreateBattle = () => {
    if (!user) {
      toast.error('Please login to create a battle');
      return;
    }

    if (newBattle.price <= 0 || newBattle.casesToOpen <= 0 || newBattle.maxPlayers <= 1) {
      toast.error('Please enter valid battle details');
      return;
    }

    if (user.balance < newBattle.price) {
      toast.error('Insufficient balance to create this battle');
      return;
    }

    const battle: CaseBattle = {
      id: `battle_${Date.now()}`,
      name: newBattle.name || `${user.username}'s Battle`,
      price: newBattle.price,
      casesToOpen: newBattle.casesToOpen,
      maxPlayers: newBattle.maxPlayers,
      currentPlayers: 1,
      status: 'waiting'
    };
    
    setBattles(prev => [battle, ...prev]);
    updateBalance(-newBattle.price); // Deduct the battle cost
    
    setIsCreateDialogOpen(false);
    setNewBattle({
      name: '',
      price: 100,
      casesToOpen: 3,
      maxPlayers: 2
    });
    
    toast.success('Battle created successfully!');
  };

  const joinBattle = (battleId: string) => {
    if (!user) {
      toast.error('Please login to join a battle');
      return;
    }
    
    const battle = battles.find(b => b.id === battleId);
    if (!battle) return;
    
    if (user.balance < battle.price) {
      toast.error('Insufficient balance to join this battle');
      return;
    }
    
    setBattles(prev => prev.map(b => {
      if (b.id === battleId) {
        return {
          ...b,
          currentPlayers: b.currentPlayers + 1,
          status: b.currentPlayers + 1 >= b.maxPlayers ? 'in-progress' : 'waiting'
        };
      }
      return b;
    }));
    
    updateBalance(-battle.price); // Deduct the battle cost
    
    if (battle.currentPlayers + 1 >= battle.maxPlayers) {
      // Battle is full, start it
      toast.success('Battle starting!');
      setTimeout(() => {
        // Simulate battle results after 2 seconds
        const randomWinner = Math.random() > 0.5;
        if (randomWinner) {
          const winAmount = battle.price * battle.maxPlayers * 0.9; // 10% fee
          updateBalance(winAmount);
          toast.success(`You won ${winAmount} gems!`);
        } else {
          toast('Better luck next time!');
        }
        
        // Remove the battle
        setBattles(prev => prev.filter(b => b.id !== battleId));
      }, 2000);
    } else {
      toast.success('You have joined the battle');
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Case Battles</h1>
          <p className="text-muted-foreground">Compete with others opening cases for the best rewards</p>
        </div>
        
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-game-cases hover:bg-game-cases/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Battle
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Battles</TabsTrigger>
          <TabsTrigger value="mine">My Battles</TabsTrigger>
          <TabsTrigger value="high">High Stakes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {battles.length > 0 ? (
            battles.map(battle => (
              <div key={battle.id} className="bg-card rounded-lg border border-border p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{battle.name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Gem className="h-4 w-4 text-gem" />
                      <span>{battle.price} per player</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Timer className="h-4 w-4" />
                      <span>{battle.casesToOpen} cases</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{battle.currentPlayers}/{battle.maxPlayers}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Button 
                    onClick={() => joinBattle(battle.id)}
                    disabled={!user || battle.currentPlayers >= battle.maxPlayers}
                    className="bg-game-cases hover:bg-game-cases/90"
                  >
                    Join Battle
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No active battles. Create one!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="mine">
          <div className="text-center py-16">
            <p className="text-muted-foreground">You haven't created any battles yet.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="high">
          <div className="text-center py-16">
            <p className="text-muted-foreground">No high stakes battles available at the moment.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Create Battle Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Battle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Battle Name</label>
              <Input
                value={newBattle.name}
                onChange={(e) => setNewBattle({...newBattle, name: e.target.value})}
                placeholder="Enter battle name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Price per Player (gems)</label>
              <Input
                type="number"
                value={newBattle.price}
                onChange={(e) => setNewBattle({...newBattle, price: parseInt(e.target.value) || 0})}
                min={10}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cases to Open</label>
              <Input
                type="number"
                value={newBattle.casesToOpen}
                onChange={(e) => setNewBattle({...newBattle, casesToOpen: parseInt(e.target.value) || 0})}
                min={1}
                max={10}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Players</label>
              <Input
                type="number"
                value={newBattle.maxPlayers}
                onChange={(e) => setNewBattle({...newBattle, maxPlayers: parseInt(e.target.value) || 0})}
                min={2}
                max={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleCreateBattle}
              className="bg-game-cases hover:bg-game-cases/90"
              disabled={!user || user.balance < newBattle.price}
            >
              Create Battle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaseBattles;
