
import React from 'react';
import GameCard from '@/components/GameCard';
import { ArrowRight, Award, Gem, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index: React.FC = () => {
  return (
    <div className="container py-8 space-y-16">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Welcome to <span className="text-primary">GemStorm</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Experience thrilling case battles, test your luck in mines, master blackjack,
          and participate in gem rains for exciting rewards!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/cases" className="btn-game btn-cases">
            Start Gaming Now
          </Link>
        </div>
      </div>

      {/* Featured Games */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured Games</h2>
          <Link to="/games" className="text-primary flex items-center gap-1 hover:underline">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GameCard
            title="Case Battles"
            description="Compete with others opening virtual cases for the best rewards."
            imagePath="/placeholder.svg"
            path="/cases"
            buttonText="Open Cases"
            buttonClass="btn-cases"
          />
          
          <GameCard
            title="Mines"
            description="Navigate through a minefield to win gems without hitting bombs."
            imagePath="/placeholder.svg"
            path="/mines"
            buttonText="Play Mines"
            buttonClass="btn-mines"
          />
          
          <GameCard
            title="Blackjack"
            description="Classic card game where you aim to beat the dealer without going over 21."
            imagePath="/placeholder.svg"
            path="/blackjack"
            buttonText="Play Blackjack"
            buttonClass="btn-blackjack"
          />
        </div>
      </section>

      {/* Features */}
      <section className="bg-card rounded-xl border border-border p-8 shadow-inner">
        <h2 className="text-2xl font-bold mb-8 text-center">Why Play on GemStorm?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Games</h3>
            <p className="text-muted-foreground">Quick and exciting games that deliver instant results.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
              <Gem className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gem Rain</h3>
            <p className="text-muted-foreground">Join regular gem rains every 30 minutes to collect free rewards.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Daily Rewards</h3>
            <p className="text-muted-foreground">Claim daily bonuses and participate in special events.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fair Play</h3>
            <p className="text-muted-foreground">All games are provably fair with transparent mechanics.</p>
          </div>
        </div>
      </section>

      {/* Latest Winners */}
      <section>
        <h2 className="text-2xl font-bold mb-8 text-center">Latest Winners</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-card rounded-lg p-4 border border-border flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/20 rounded-full"></div>
              <div>
                <p className="font-medium">User{index + 1}</p>
                <p className="text-sm text-muted-foreground">
                  won <span className="gem-text">{(Math.random() * 10000).toFixed(0)}</span> gems
                </p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                {Math.floor(Math.random() * 50) + 1}m ago
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
