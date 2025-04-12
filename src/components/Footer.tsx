
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">GemStorm</h3>
            <p className="text-muted-foreground">
              An exciting gaming platform with case battles, mines, blackjack and more!
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/cases" className="hover:text-primary transition-colors">Case Battles</Link></li>
              <li><Link to="/mines" className="hover:text-primary transition-colors">Mines</Link></li>
              <li><Link to="/blackjack" className="hover:text-primary transition-colors">Blackjack</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Twitter size={16} /> Twitter
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Github size={16} /> GitHub
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <ExternalLink size={16} /> Website
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} GemStorm. All rights reserved.</p>
          <p className="mt-1">For entertainment purposes only. No real money is involved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
