// src/components/EcoPointsBadge.jsx
import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseService';

export default function EcoPointsBadge() {
  const { currentUser, userProfile } = useAuth();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchPoints = async () => {
      if (currentUser) {
        // First try to get from userProfile context
        if (userProfile?.ecoPoints !== undefined) {
          setPoints(userProfile.ecoPoints);
        } else {
          // Fallback to fetching from Firebase
          const profile = await firebaseService.getUserProfile(currentUser.uid);
          if (profile) {
            setPoints(profile.ecoPoints || 0);
          }
        }
      }
    };
    
    fetchPoints();
  }, [currentUser, userProfile]);

  return (
    <div className="flex items-center gap-1.5 bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full text-sm font-semibold">
      <Leaf size={14} />
      <span>{points} pts</span>
    </div>
  );
}