'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/store/useAuth'
import { useNote } from '@/store/useNote'
import { imgUrl } from '@/lib/url'
import { useFavorite } from '@/store/useFavorite'
import { Avatar, Button } from 'antd'
import { EditProfileModal } from '@/components/modal/EditProfileModal'

export default function Profile() {
    const { user, checkSession, token } = useAuth()
    const { myItems, loadMine } = useNote();
    const { items, load } = useFavorite()

    const [openEdit, setOpenEdit] = useState(false);

    const loadRef = useRef(false)
    useEffect(() => {
        if(loadRef.current) return
        loadRef.current = true
        checkSession()
        loadMine({ page: 1, perPage: 12 })
    }, [checkSession, loadMine])

    const loadFavRef = useRef(false)
    useEffect(() => {
        if(loadFavRef.current) return
        loadFavRef.current = true
        load({ page: 1, perPage: 12 })
    }, [load])
    
    const display = {
        name: user?.username || "User",
        avatar: user?.profile_img ? imgUrl(user?.profile_img) : "/assets/profile.png",
        cover: user?.thumbnail_img ? imgUrl(user?.thumbnail_img) : "/assets/thumbnail.jpeg"
    }

    const totalUploaded = myItems.length
    const totalLikes = items.length

  return (
    <div className='space-y-6'>
        <div className='relative'>
            <img 
                src={display.cover || undefined}
                alt='cover'
                className='w-full h-72 object-cover rounded-2xl border border-neutral-200'
            />
            <Avatar 
                src={display.avatar || undefined}
                size={124}
                className='
                    !absolute -bottom-14 left-auto right-6 translate-x-0 border-4 border-white shadow scale-100
                '
            />
        </div>

        <div className="flex items-center justify-between gap-4">
            <div className='flex flex-col items-start text-left'>
                <div className='flex flex-row items-center gap-4'>
                    <h1 className='inline-flex items-center text-3xl font-semibold text-neutral-800 leading-none'>
                        {display.name}
                    </h1>
                    <Button
                        className='!rounded-full !px-4 !h-9 !text-sm !border-(--secondary-color) !text-(--secondary-color)
                        hover:!bg-(--secondary-color) hover:!text-white transition-all'
                        onClick={() => setOpenEdit(true)}
                    >
                        Edit Profile
                    </Button>
                </div>
                <p className='text-sm text-slate-500 mt-1'>
                    {totalUploaded} Uploaded | {totalLikes} Likes
                </p>
            </div> 
        </div>

        <EditProfileModal open={openEdit} onClose={() => setOpenEdit(false)} />
    </div>
  )
}
