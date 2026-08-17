import React from 'react';
import { MainLayout } from './MainLayout';

export interface LayoutProps {
  onResetData?: () => void;
}

export const CitizenLayout: React.FC<LayoutProps> = ({ onResetData }) => {
  return <MainLayout currentRole="citizen" onResetData={onResetData} />;
};

export const PoliceLayout: React.FC<LayoutProps> = ({ onResetData }) => {
  return <MainLayout currentRole="police" onResetData={onResetData} />;
};
