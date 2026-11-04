"use client";

import { useEffect, useRef, useState } from "react";
import { useAllUsers } from "../hooks/useAllUsers";

// UserModal Component
interface UserModalProps {
  user: any;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
}

function UserModal({ user, loading, error, onClose }: UserModalProps) {
  if (!user && !loading) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="sticky top-0 right-0 float-right m-4 text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          &times;
        </button>

        {loading ? (
          <div className="text-center text-pink-600 font-semibold animate-pulse py-12">
            Loading user details...
          </div>
        ) : error ? (
          <div className="text-center text-red-600 font-semibold py-12">{error}</div>
        ) : (
          <div className="p-6 pt-2">
            {/* Header with Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
             <img
  src={user.userImage?.url || "/repro1.jpeg"}
  alt={user.name || "User"}
  className="w-24 h-24 rounded-full object-cover border-4 border-pink-400 shadow-lg"
  onError={(e) => {
    e.currentTarget.src = "/repro1.jpeg";  // use your existing image
  }}
/>

                <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <h2 className="font-bold text-2xl text-gray-800">{user.name}</h2>
              {user.role && (
                <span className="mt-2 px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold uppercase">
                  {user.role}
                </span>
              )}
            </div>

            {/* User Details */}
            <div className="space-y-4">
              {/* Email */}
              {user.email && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm text-gray-800 break-all">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {user.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    <p className="text-sm text-gray-800">{user.phone}</p>
                  </div>
                </div>
              )}

              {/* Username */}
              {user.username && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Username</p>
                    <p className="text-sm text-gray-800">@{user.username}</p>
                  </div>
                </div>
              )}

              {/* Address */}
              {user.address && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Address</p>
                    <p className="text-sm text-gray-800">{user.address}</p>
                  </div>
                </div>
              )}

              {/* Joined Date */}
              {user.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Joined</p>
                    <p className="text-sm text-gray-800">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Bio */}
              {user.bio && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-2">Bio</p>
                  <p className="text-sm text-gray-800 leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Status */}
              {user.status && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-2">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status.toLowerCase() === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.status}
                  </span>
                </div>
              )}

              {/* Gender */}
              {user.gender && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-2">Gender</p>
                  <p className="text-sm text-gray-800 capitalize">{user.gender}</p>
                </div>
              )}

              {/* Date of Birth */}
              {user.dateOfBirth && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-2">Date of Birth</p>
                  <p className="text-sm text-gray-800">
                    {new Date(user.dateOfBirth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              )}

              {/* Additional fields - display any other properties */}
              {Object.keys(user).map((key) => {
                const excludedKeys = [
                  '_id', 'name', 'email', 'phone', 'username', 'address', 
                  'createdAt', 'updatedAt', 'role', 'bio', 'status', 
                  'userImage', 'gender', 'dateOfBirth', '__v', 'password'
                ];
                
                if (excludedKeys.includes(key) || !user[key]) return null;
                
                return (
                  <div key={key} className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 font-medium mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm text-gray-800">
                      {typeof user[key] === 'object' 
                        ? JSON.stringify(user[key], null, 2) 
                        : String(user[key])
                      }
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Action Button */}
            <button 
              className="mt-6 w-full py-3 bg-linear-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 active:scale-95 transition-all shadow-lg"
              onClick={onClose}
            >
              Close Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Carousel Component
export default function RecentUsersCarousel() {
  const {
    users,
    loading,
    error,
    fetchUsers,
    selectedUser,
    fetchUserById,
    modalLoading,
    modalError,
    setSelectedUser,
  } = useAllUsers();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Automatic horizontal scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || users.length === 0) return;

    let animationFrameId: number;
    let scrollPosition = 0;
    const speed = 0.5;

    const scroll = () => {
      if (!isPaused && container) {
        scrollPosition += speed;
        if (scrollPosition >= container.scrollWidth / 2) scrollPosition = 0;
        container.scrollLeft = scrollPosition;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [users, isPaused]);

  const duplicatedUsers = [...users, ...users];

  return (
    <div className="w-full max-w-7xl mx-auto bg-linear-to-br from-pink-50 via-purple-50 to-indigo-50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-pink-600">
          ✨ Recently Joined Users
        </h3>
        <button
          onClick={fetchUsers}
          className="text-xs sm:text-sm font-semibold text-purple-600 hover:underline hover:text-purple-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center text-pink-600 font-semibold animate-pulse py-8 sm:py-12">
          Loading users...
        </div>
      ) : error ? (
        <div className="text-center text-red-600 font-semibold py-8 sm:py-12">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-500 font-medium py-8 sm:py-12">
          No users found
        </div>
      ) : (
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex overflow-hidden space-x-3 sm:space-x-4 py-3 sm:py-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {duplicatedUsers.map((user: any, i: number) => (
            <div
              key={`${user._id}-${i}`}
              onClick={() => fetchUserById(user._id)}
              className="flex-none w-28 sm:w-32 md:w-36 lg:w-40 p-3 sm:p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer relative"
            >
              <div className="relative mb-2 sm:mb-3">
                <img
                  src={user.userImage?.url || "/avatars/default.png"}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-pink-400 hover:scale-110 transition-transform mx-auto"
                  alt={user.name || "User"}
                  onError={(e) => {
                    e.currentTarget.src = "/avatars/default.png";
                  }}
                />
                {i % users.length === 0 && (
                  <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></span>
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold text-xs sm:text-sm md:text-base text-gray-800 truncate px-1">
                  {user.name || "No Name"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="mt-4 sm:mt-6 w-full py-2 sm:py-3 bg-pink-600 text-white font-semibold rounded-full hover:bg-pink-500 active:scale-95 transition-all shadow-lg text-sm sm:text-base">
        View All Users
      </button>

      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          loading={modalLoading}
          error={modalError}
        />
      )}

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}