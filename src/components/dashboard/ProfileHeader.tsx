import Image from 'next/image';
import { StravaAthlete } from '@/types/strava';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/strava';
import { DeleteDataButton } from './DeleteDataButton';

interface ProfileHeaderProps {
  athlete: StravaAthlete;
}

export function ProfileHeader({ athlete }: ProfileHeaderProps) {
  const location = [athlete.city, athlete.state, athlete.country]
    .filter(Boolean)
    .join(', ') || 'Location not specified';

  return (
    <Card glass className="text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex-shrink-0">
          {athlete.profile_medium || athlete.profile ? (
            <Image
              src={athlete.profile_medium || athlete.profile || ''}
              alt={`${athlete.firstname} ${athlete.lastname}`}
              width={120}
              height={120}
              className="rounded-full border-2 border-white/20"
            />
          ) : (
            <div className="w-30 h-30 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">
            {athlete.firstname} {athlete.lastname}
          </h1>
          <p className="text-white/80 mb-2">📍 {location}</p>
          {athlete.bio && (
            <p className="text-white/70 italic mb-4">"{athlete.bio}"</p>
          )}
          
          <div className="border-t border-white/20 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <p className="text-white/60">Strava ID</p>
                <p className="font-semibold">{athlete.id}</p>
              </div>
              <div>
                <p className="text-white/60">Member Since</p>
                <p className="font-semibold">{formatDate(athlete.created_at)}</p>
              </div>
              {athlete.premium && (
                <div>
                  <p className="text-white/60">Status</p>
                  <p className="font-semibold">Premium Member ⭐</p>
                </div>
              )}
              {athlete.friend_count !== undefined && (
                <div>
                  <p className="text-white/60">Friends</p>
                  <p className="font-semibold">{athlete.friend_count}</p>
                </div>
              )}
            </div>
            
            {/* Data Management Section */}
            <div className="border-t border-white/20 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="text-white font-medium mb-1">Data Management</h4>
                  <p className="text-white/60 text-sm">Permanently remove all your data from our systems</p>
                </div>
                <DeleteDataButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}