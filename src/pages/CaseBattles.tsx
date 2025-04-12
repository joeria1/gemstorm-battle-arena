import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { CaseBattle } from '@/types';
import { useUser } from '@/context/UserContext';
import { Plus, Users, Timer, Gem, Package, Trophy, Star, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from '@/components/ui/sonner';

// Case Battle Images
const caseImages = [
  '/case-blue.png',
  '/case-red.png',
  '/case-green.png',
  '/case-purple.png',
  '/case-gold.png'
];

// Case Battle Types
const caseTypes = [
  { name: 'Basic', color: 'bg-blue-500', icon: <Package /> },
  { name: 'Premium', color: 'bg-purple-500', icon: <Star /> },
  { name: 'Elite', color: 'bg-red-500', icon: <Trophy /> },
  { name: 'Ultimate', color: 'bg-amber-500', icon: <Sparkles /> }
];

const CaseBattles: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateBalance } = useUser();
  const [battles, setBattles] = useState<CaseBattle[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBattle, setNewBattle] = useState({
    name: '',
    price: 100,
    casesToOpen: 3,
    maxPlayers: 2,
    caseType: 0
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
        status: 'waiting',
        caseType: 1,
        creator: 'Player123'
      },
      {
        id: '2',
        name: 'High Rollers',
        price: 1000,
        casesToOpen: 3,
        maxPlayers: 4,
        currentPlayers: 2,
        status: 'waiting',
        caseType: 3,
        creator: 'VIPGamer'
      },
      {
        id: '3',
        name: 'Budget Battle',
        price: 200,
        casesToOpen: 2,
        maxPlayers: 2,
        currentPlayers: 1,
        status: 'waiting',
        caseType: 0,
        creator: 'Newbie42'
      },
      {
        id: '4',
        name: 'Gem Hunters',
        price: 750,
        casesToOpen: 4,
        maxPlayers: 3,
        currentPlayers: 0,
        status: 'waiting',
        caseType: 2,
        creator: 'ProHunter'
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
      status: 'waiting',
      caseType: newBattle.caseType,
      creator: user.username
    };
    
    setBattles(prev => [battle, ...prev]);
    updateBalance(-newBattle.price); // Deduct the battle cost
    
    setIsCreateDialogOpen(false);
    setNewBattle({
      name: '',
      price: 100,
      casesToOpen: 3,
      maxPlayers: 2,
      caseType: 0
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
      
      // Navigate to the case opening page with battle info
      navigate('/case-opening', { state: { battle } });
    } else {
      toast.success('You have joined the battle');
    }
  };

  const renderCaseImage = (caseType: number) => {
    const type = caseTypes[caseType % caseTypes.length];
    return (
      <div className={`relative flex items-center justify-center ${type.color} bg-opacity-20 p-4 rounded-lg border-2 border-opacity-50`}>
        <div className="absolute top-2 right-2">
          {type.icon}
        </div>
        <img 
          src={`https://picsum.photos/seed/case${caseType}/200/200`}
          alt="Case"
          className="w-16 h-16 object-contain filter drop-shadow-lg"
        />
      </div>
    );
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
              <div key={battle.id} className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="bg-gradient-to-r from-transparent to-primary/5 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {renderCaseImage(battle.caseType)}
                      <div>
                        <h3 className="font-semibold text-lg">{battle.name}</h3>
                        <p className="text-xs text-muted-foreground">Created by {battle.creator}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Gem className="h-4 w-4 text-gem" />
                        <span>{battle.price} per player</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Timer className="h-4 w-4" />
                        <span>{battle.casesToOpen} cases</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{battle.currentPlayers}/{battle.maxPlayers}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 bg-card p-3 rounded-lg self-start md:self-center shadow-md">
                    <div className="text-center mb-2 text-xs font-medium">Total Prize</div>
                    <div className="flex items-center justify-center gap-1.5">
                      <Gem className="h-4 w-4 text-gem" />
                      <span className="text-lg font-bold text-gem">{battle.price * battle.maxPlayers * 0.9}</span>
                    </div>
                    
                    <Button 
                      onClick={() => joinBattle(battle.id)}
                      disabled={!user || battle.currentPlayers >= battle.maxPlayers}
                      className="bg-game-cases hover:bg-game-cases/90 w-full mt-3"
                      size="sm"
                    >
                      Join Battle
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 bg-primary/5 flex justify-between items-center">
                  <div className="flex gap-2">
                    {Array(battle.maxPlayers).fill(0).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border ${
                          i < battle.currentPlayers ? 'bg-primary/20 border-primary' : 'bg-muted border-border'
                        }`}
                      >
                        {i < battle.currentPlayers ? (i === 0 ? battle.creator.substring(0, 1) : 'P') : ''}
                      </div>
                    ))}
                  </div>
                  
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    battle.status === 'waiting' ? 'bg-amber-500/20 text-amber-500' : 
                    battle.status === 'in-progress' ? 'bg-blue-500/20 text-blue-500' : 
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {battle.status === 'waiting' ? 'Waiting' : 
                     battle.status === 'in-progress' ? 'In Progress' : 'Completed'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <Card className="border-dashed animate-pulse">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active battles. Create one!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="mine">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You haven't created any battles yet.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Battle
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="high">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No high stakes battles available at the moment.</p>
              <p className="text-xs text-muted-foreground mt-1">High stakes battles have minimum bets of 1000 gems</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create Battle Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Battle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Battle Name</label>
              <Input
                value={newBattle.name}
                onChange={(e) => setNewBattle({...newBattle, name: e.target.value})}
                placeholder="Enter battle name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Case Type</label>
              <div className="grid grid-cols-4 gap-2">
                {caseTypes.map((type, index) => (
                  <Button
                    key={index}
                    variant={newBattle.caseType === index ? "default" : "outline"}
                    className={`flex flex-col h-auto p-2 ${newBattle.caseType === index ? type.color : ''}`}
                    onClick={() => setNewBattle({...newBattle, caseType: index})}
                  >
                    {type.icon}
                    <span className="text-xs mt-1">{type.name}</span>
                  </Button>
                ))}
              </div>
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
            
            <div className="bg-muted p-4 rounded-lg mt-4">
              <div className="text-sm font-medium mb-2">Preview</div>
              <div className="flex items-center gap-3">
                {renderCaseImage(newBattle.caseType)}
                <div>
                  <p className="font-medium">{newBattle.name || "Your Battle"}</p>
                  <div className="text-xs text-muted-foreground">
                    {newBattle.casesToOpen} cases • {newBattle.maxPlayers} players
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleCreateBattle}
              className="bg-game-cases hover:bg-game-cases/90 w-full"
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
