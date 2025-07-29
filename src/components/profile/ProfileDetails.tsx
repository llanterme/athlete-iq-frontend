'use client';

import Image from 'next/image';
import { StravaAthlete } from '@/types/strava';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/strava';
import { DeleteDataButton } from '../dashboard/DeleteDataButton';

interface ProfileDetailsProps {
  athlete: StravaAthlete;
}

export function ProfileDetails({ athlete }: ProfileDetailsProps) {
  const location = [athlete.city, athlete.state, athlete.country]
    .filter(Boolean)
    .join(', ') || 'Location not specified';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card glass className="text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            {athlete.profile_medium || athlete.profile ? (
              <Image
                src={athlete.profile_medium || athlete.profile || ''}
                alt={`${athlete.firstname} ${athlete.lastname}`}
                width={150}
                height={150}
                className="rounded-full border-4 border-white/20 shadow-lg"
              />
            ) : (
              <div className="w-36 h-36 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/20">
                <span className="text-4xl">👤</span>
              </div>
            )}
          </div>

          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">
              {athlete.firstname} {athlete.lastname}
            </h1>
            <p className="text-white/80 text-lg mb-4 flex items-center justify-center lg:justify-start gap-2">
              <span>📍</span>
              {location}
            </p>
            {athlete.bio && (
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <p className="text-white/90 italic text-lg leading-relaxed">
                  "{athlete.bio}"
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <Card glass className="text-white">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>🏃‍♂️</span>
          Strava Account Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/60 text-sm font-medium mb-1">Strava ID</p>
            <p className="text-xl font-bold">{athlete.id}</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/60 text-sm font-medium mb-1">Member Since</p>
            <p className="text-xl font-bold">{formatDate(athlete.created_at)}</p>
          </div>
          
          {athlete.premium && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/60 text-sm font-medium mb-1">Status</p>
              <p className="text-xl font-bold flex items-center gap-2">
                Premium Member <span className="text-yellow-400">⭐</span>
              </p>
            </div>
          )}
          
          {athlete.friend_count !== undefined && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/60 text-sm font-medium mb-1">Friends</p>
              <p className="text-xl font-bold">{athlete.friend_count}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Additional Profile Stats */}
      {(athlete.follower_count !== undefined || athlete.mutual_friend_count !== undefined || athlete.sex) && (
        <Card glass className="text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📊</span>
            Profile Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {athlete.follower_count !== undefined && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-sm font-medium mb-1">Followers</p>
                <p className="text-xl font-bold">{athlete.follower_count}</p>
              </div>
            )}
            
            {athlete.mutual_friend_count !== undefined && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-sm font-medium mb-1">Mutual Friends</p>
                <p className="text-xl font-bold">{athlete.mutual_friend_count}</p>
              </div>
            )}
            
            {athlete.sex && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-sm font-medium mb-1">Gender</p>
                <p className="text-xl font-bold">{athlete.sex === 'M' ? 'Male' : athlete.sex === 'F' ? 'Female' : 'Other'}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Data Management */}
      <Card glass className="text-white">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>⚙️</span>
          Data Management
        </h2>
        
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Delete All Data</h3>
              <p className="text-white/70 leading-relaxed">
                Permanently remove all your data from our systems. This action cannot be undone and will delete:
              </p>
              <ul className="mt-2 text-white/60 text-sm space-y-1 ml-4">
                <li>• All activity data and analytics</li>
                <li>• Chat conversation history</li>
                <li>• Personal preferences and settings</li>
                <li>• Race planning information</li>
              </ul>
            </div>
            <div className="flex-shrink-0">
              <DeleteDataButton />
            </div>
          </div>
        </div>
      </Card>

      {/* Future Profile Editing Section - Placeholder */}
      <Card glass className="text-white opacity-60">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>✏️</span>
          Edit Profile
        </h2>
        
        <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
          <div className="text-4xl mb-4">🚧</div>
          <p className="text-white/80 mb-2">Profile editing coming soon!</p>
          <p className="text-white/60 text-sm">
            Update your personal information, preferences, and account settings.
          </p>
        </div>
      </Card>
    </div>
  );
}