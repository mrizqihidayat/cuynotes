"use client"

import React, { useEffect, useRef } from 'react';
import { Spin, Empty } from 'antd';
import CardNote from "@/components/CardNote";
import { colorForNote } from '@/utils/color';
import { colors } from '@/constants/colors';
import { useFavorite } from '@/store/useFavorite';

export default function Favorites() {
    const { items, loading, load } = useFavorite() 
    const loadRef = useRef(false);

    useEffect(() => {
        if(loadRef.current) return
        loadRef.current = true
        load({ page: 1, perPage: 12 })
    }, [load])

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
