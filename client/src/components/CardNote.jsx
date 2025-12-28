import React from 'react';
import { Card } from "antd";
import { Avatar, Tooltip, message } from "antd";
import { RiLockLine, RiStarSFill, RiShareForwardFill, RiUser3Line } from 'react-icons/ri';
import { formatDate } from '@/utils/formatDate';
import { imgUrl } from '@/lib/url';
import { useFavorite } from '@/store/useFavorite'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';

const FRONTEND_BASE = (process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || '').replace(/\/+$/, '') || (typeof window !== 'undefined' ? window.location.origin : '')

const CardNote = ({ note, bg, onFavoriteChange, showPrivateIcon = true }) => {
    const {token} = useAuth();
    const router = useRouter();

    const isPrivateLike = note?.status === "private" || note?.status === "protected"
    const author = note?.user?.username || "anonymous"
    const date = formatDate(note?.created_at)
    const cardBg = bg || 'var(--secondary-light-color)'
    const slug = note?.slug || ''

    const redirectToAuth = () => router.push('/?auth=1')

    const favoriteIds = useFavorite(s => s.favoriteIds)
    const pendingIds = useFavorite(s => s.pendingIds)
    const toggleFav = useFavorite(s => s.toggle)

    const keyId = String(note?.id ?? '')
    const fav = favoriteIds.has(keyId)
    const toggling = pendingIds.has(keyId)

    const handleShare = async (event) => {
        event.stopPropagation()
        if(!token) {redirectToAuth(); return}

        const urlShare = `${FRONTEND_BASE}/note/${encodeURIComponent(slug)}`

        if(navigator.share) {
            try {
                await navigator.share({ title: note?.title || "CuyNotes", url: urlShare})
                return
            } catch (error) {
                console.error("gagal untuk share")                
            }
        }
        
        try {
            await navigator.clipboard.writeText(urlShare)
            message.success("Link berhasil di salin!")
        } catch (error) {
            message.info(urlShare)
        }
    }

    const goDetail = () => {
        if(slug) router.push(`/note/${encodeURIComponent(slug)}`)
    }

    const onKeyDetail = (e) => {
        if(e.key === 'Enter' || e.key === ' '){
            e.prenventDefault()
            goDetail()
        }
    }

  return (
    <div className='relative'>
        <Card
            className='note-card !border !rounded-2xl cursor-pointer'
            style={{ background: cardBg }}
            styles={{ body: {padding: 16} }}
            hoverable
            tabIndex={0}
            onClick={goDetail}
            onKeyDown={onKeyDetail}
            aria-label={note?.title || note?.title !== "Untitled" ? `Buka Catatan ${note?.title}` : "Buka Catatan"}
        >
            {note?.title !== "Untitled" &&(
                <h3 className='font-semibold mb-2 text-neutral-800 text-xl sm:text-base '>
                    {note?.title}
                </h3>
            )}

            <div 
                className="text-sm text-neutral-800 font-normal break-words"
                dangerouslySetInnerHTML={{ __html: note?.content }}
            />

            <div className='flex flex-row justify-between gap-3 mt-4'>
                <div className='flex items-center gap-3'>
                    {note?.user?.profile_img
                    ?         
                        <Avatar 
                            src={imgUrl(note?.user?.profile_img) || undefined}
                            alt='image user'
                            size={38}
                            className='shrink-0'
                        />
                    :
                    <Avatar 
                        src={<RiUser3Line className='text-neutral-800' />}
                        alt='image user'
                        size={28}
                        className='shrink-0'
                    />
                    }


                    <div className='flex flex-col'>
                        <h4 className='text-base font-semibold truncate'>{author}</h4>
                        <p className='text-xs font-normal'>{date}</p>
                    </div>
                </div>

                <div className='flex items-center gap-3'>
                    {showPrivateIcon && isPrivateLike && (
                        <Tooltip title={note?.status === 'protected' ? "Protected" : "Private"}>
                            <span onClick={e => e.stopPropagation()}>
                                <RiLockLine size={25} className='cursor-pointer text-neutral-600'/>
                            </span>
                        </Tooltip>
                    )}
                    
                    <Tooltip title={`${fav ? "Favorited" : "Favorite"}`}>
                        <span
                            className={`inline-flex ${toggling ? 'opacity-60' :
                                "opacity-100"}`}
                            onClick={(e) => { e.stopPropagation(); toggleFav(note.id)}}
                            aria-pressed={fav}
                            data-id={keyId}
                            data-fav={fav ? '1' : '0'}
                            key={fav ? `fav-${keyId}` : `unfav-${keyId}`}
                        >
                            <RiStarSFill size={25} className={`cursor-pointer ${fav ? "!text-(--primary-color)": "!text-zinc-300"}`}/>
                        </span>
                    </Tooltip>

                    <Tooltip title={"Share"}>
                        <span onClick={handleShare}>
                            <RiShareForwardFill size={27} className='cursor-pointer text-neutral-500 hover:text-neutral-700'/>
                        </span>
                    </Tooltip>
                </div>
            </div>
        </Card>
    </div>
  )
}

export default CardNote