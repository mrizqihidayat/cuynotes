"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Spin, Empty, Button } from 'antd';
import CardNote from "@/components/CardNote";
import { colorForNote } from '@/utils/color';
import { colors } from '@/constants/colors';
import { useFavorite } from '@/store/useFavorite';
import { useNote } from '@/store/useNote';
import { useAuth } from '@/store/useAuth';
import { NoteEditModal } from '@/components/modal/NoteEditModal';

export default function Favorites() {
    const { checkSession, token } = useAuth()
    const { myItems, loadMine, loading } = useNote() 

    const [openEditNote, setOpenEditNote] = useState(false)
    const [selectedNote, setSelectedNote] = useState(null)

    const loadFavIds = useFavorite(s => s.loadIds)
    
    const loadRef = useRef(false);
    useEffect(() => {
        if(loadRef.current) return
        loadRef.current = true
        checkSession()
        loadMine({ page: 1, perPage: 12 })
    }, [loadMine])

    useEffect(() => {
        if(token) {
            loadFavIds().catch(() => {})
        }
    }, [token, loadFavIds])

  if(loading) {
    return <div className='py-10 flex justify-center'><Spin /></div>
  }

  if(!myItems.length) {
    return <div className='py-10'><Empty /></div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {myItems.map((note, i) => (
        <div key={i} className='relative group'>
          <CardNote note={note} bg={colorForNote(i, colors)} />
          <Button 
            size='small'
            className='!rounded-full !px-3 !h-7 absolute top-2 right-2 opacity-0 group-hover:opacity-100 tarnsition'
            onClick={() => {
                setSelectedNote(note)
                setOpenEditNote(true)
            }}
          >
            Edit
          </Button>
        </div>
      ))}

      {
        selectedNote && (
            <NoteEditModal 
                open={openEditNote}
                note={selectedNote}
                onClose={() => setOpenEditNote(false)}
                onUpdated={(n) => setSelectedNote(n)}
            />
        )
      }
    </div>
  );
}
