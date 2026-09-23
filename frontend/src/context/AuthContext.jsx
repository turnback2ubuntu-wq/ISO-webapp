import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ROLES } from '../data/initialMockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Load roles from localStorage or INITIAL_ROLES
  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem('prodidoc_custom_roles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved roles from localStorage', e);
    }
    return INITIAL_ROLES;
  });

  const [activeRoleKey, setActiveRoleKey] = useState(() => {
    const saved = localStorage.getItem('prodidoc_active_role');
    return saved && roles[saved] ? saved : 'gpm';
  });

  useEffect(() => {
    localStorage.setItem('prodidoc_active_role', activeRoleKey);
  }, [activeRoleKey]);

  useEffect(() => {
    localStorage.setItem('prodidoc_custom_roles', JSON.stringify(roles));
  }, [roles]);

  const activeRole = roles[activeRoleKey] || roles.gpm || Object.values(roles)[0];

  const switchRole = (roleKey) => {
    if (roles[roleKey]) {
      setActiveRoleKey(roleKey);
    }
  };

  const updateRole = (roleKey, updatedData) => {
    setRoles((prev) => {
      const existing = prev[roleKey] || {};
      const updated = {
        ...prev,
        [roleKey]: {
          ...existing,
          ...updatedData,
          id: roleKey,
          permissions: {
            ...(existing.permissions || {}),
            ...(updatedData.permissions || {}),
          },
        },
      };
      return updated;
    });
  };

  const addRole = (newKey, newRoleData) => {
    const cleanKey = newKey.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanKey) return false;
    setRoles((prev) => ({
      ...prev,
      [cleanKey]: {
        id: cleanKey,
        title: newRoleData.title || 'Peran Baru',
        shortTitle: newRoleData.shortTitle || cleanKey.toUpperCase(),
        name: newRoleData.name || 'Nama Pejabat',
        nip: newRoleData.nip || '-',
        department: newRoleData.department || 'Program Studi',
        badgeClass: newRoleData.badgeClass || 'gpm',
        avatar: newRoleData.avatar || '👤',
        permissions: {
          canUpload: false,
          canRevise: false,
          canComment: true,
          canApproveFormal: false,
          canIssueNCR: false,
          canSignReport: false,
          ...(newRoleData.permissions || {}),
        },
      },
    }));
    return cleanKey;
  };

  const deleteRole = (roleKey) => {
    const keys = Object.keys(roles);
    if (keys.length <= 1) return false;

    if (activeRoleKey === roleKey) {
      const fallbackKey = keys.find((k) => k !== roleKey) || 'gpm';
      setActiveRoleKey(fallbackKey);
    }

    setRoles((prev) => {
      const copy = { ...prev };
      delete copy[roleKey];
      return copy;
    });
    return true;
  };

  const resetRoles = () => {
    localStorage.removeItem('prodidoc_custom_roles');
    setRoles(INITIAL_ROLES);
    if (!INITIAL_ROLES[activeRoleKey]) {
      setActiveRoleKey('gpm');
    }
  };

  return (
    <AuthContext.Provider value={{
      activeRoleKey,
      activeRole,
      switchRole,
      roles,
      allRoles: roles,
      updateRole,
      addRole,
      deleteRole,
      resetRoles,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
