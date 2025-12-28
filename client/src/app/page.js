"use client"
import React, { useEffect } from 'react';
import { Spin, Empty } from 'antd';
import CardNote from "@/components/CardNote";
import { useNote } from "@/store/useNote";
import { colorForNote } from '@/utils/color';
import { colors } from '@/constants/colors';
import { useFavorite } from '@/store/useFavorite';
import { useAuth } from '@/store/useAuth';

export default function Home() {
  const { token } = useAuth()
  const { items, loading, loadPublic } = useNote()
  const loadFavIds = useFavorite(s => s.loadIds)

  useEffect(() => {
    loadPublic({ page: 1, perPage: 12 })
  }, [loadPublic])
  
  useEffect(() => {
    if(token) {
      loadFavIds().catch(() => {})
    }
  }, [token, loadFavIds])

  if(loading) {
    return <div className='py-10 flex justify-center'><Spin /></div>
  }

  if(!items.length) {
    return <div className='py-10'><Empty /></div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((note, i) => (
        <div key={i}>
          <CardNote note={note} bg={colorForNote(i, colors)} />
        </div>
      ))}
    </div>
  );
}
