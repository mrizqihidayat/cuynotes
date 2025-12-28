"use client"
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { RiArrowDownSFill, RiSearchLine } from "react-icons/ri";
import { Button, Avatar, Spin, Dropdown } from "antd";
import { AuthModal } from "@/components/modal/AuthModal";
import { useNote } from "@/store/useNote";
import { useAuth } from "@/store/useAuth";
import { imgUrl } from "@/lib/url";
import Link from "next/link";

const Navbar = () => {
    const { user, isAuthenticated, logout, checkSession } = useAuth()

    const [showModalAuth, setShowModalAuth] = useState(false)
    const [checking, setChecking] = useState(true)

    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(-1)

    const { searchResults, searchNotes, clearSearch, searchLoading } = useNote();

    const router = useRouter()
    const boxRef = useRef(null)
    const inputRef = useRef(null)
    const debounceRef = useRef(null)

    useEffect(() => {
        ;(async () => {
            await checkSession()
            setChecking(false)
        })()
    }, [checkSession])

    useEffect(() => {
        function onDocDown(e) {
            if(!boxRef.current) return
            if(!boxRef.current.contains(e.target)){
                setOpen(false)
                setActive(-1)
            }
        }

        document.addEventListener('mousedown', onDocDown)
        return () => document.removeEventListener('mousedown', onDocDown)
    }, [])

    useEffect(() => {
        function onKey(e) {
            if(e.key === "Escape"){
                setOpen(false)
                setActive(-1)
                inputRef.current?.blur()
            }
        }

        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [])

    useEffect(() => {
        setActive(-1)
        const q = query.trim()
        if ( debounceRef.current) clearTimeout(debounceRef.current)

        if(q.length < 2) {clearSearch(); return}

        debounceRef.current = setTimeout(() => {
            searchNotes(q)
        }, 300)

        return () => {
            if(debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [query, searchNotes, clearSearch])

    const onKeyDown = (e) => {
        if(!open && (e.key === "ArrowDown" || e.key === "Enter")){
            setOpen(true)
            return
        }

        if(e.key === "ArrowDown"){
            e.preventDefault()
            setActive((prev) => {
                const next = Math.min((searchResults?.length ?? 0) - 1, prev + 1)
                return next
            })
        } else if(e.key === 'Enter'){
            if(active >= 0 && searchResults[active]) {
                const slug = searchResults[active].slug
                if(slug) {
                    router.push(`/note/${encodeURIComponent(slug)}`)
                    setOpen(false)
                    setActive(-1)
                    setQuery('')
                    clearSearch()
                }
            } else {
                setActive(true)
            }
        }
    }

    const onFocus = () => {
        if((query.trim().length >=2 && searchResults.length > 0) || searchLoading) setOpen(true)
    }

    const goToNote = (slug) => {
        router.push(`/note/${encodeURIComponent(slug)}`)
        setOpen(false)
        setActive(-1)
        setQuery('')
        clearSearch()
    }

    const profileMenuItems = [
        {key: 'profile', label: <Link href="/profile">Profile</Link>},
        {type: 'divider'},
        {key: 'logout', label: <span className="text-red-500">Logout</span>},
    ]

    const onProfileMenuClick = ({ key }) => {
        if(key === 'logout') {
            logout()
            router.push('/')
        } else if(key === 'profile'){
            router.push('/profile')
        }
    }

    return (
        <header className="bg-white">
            <div className="mx-auto flex h-18 items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">

                <a className="flex items-center gap-2" href="#">
                    <Image src="/assets/logo.png" alt="logo" width={180} height={50} />
                </a>

                <div className="relative" ref={boxRef}>

                    <div className="flex items-center gap-2 border border-neutral-300 pr-2 py-2 rounded-md w-[375px]">
                        
                        {/* buat icon search */}
                        <div className="border-r border-neutral-300 px-2">
                            <RiSearchLine size={20} />
                        </div>

                        {/* input search */}
                        <input
                            ref={inputRef} 
                            type="text" 
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                if(!open) setOpen(true)
                            }}
                            onKeyDown={onKeyDown}
                            onFocus={onFocus}
                            className="outline-none" 
                            placeholder="Yuks Cari Note Disini" 
                        />
                        {searchLoading && <Spin size="small" className="ml-2"/>}
                    </div>
                    {open && query.trim().length >= 2 && (
                        <div 
                            className="absolute left-0 right-0 mt-2 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden z-50"
                            role="listbox"
                            aria-label="Hasil Pencarian Notes"
                        >
                            <div className="px-3 py-2 text-sm uppercase tracking-wide text-neutral-500 border-b border-neutral-100">
                                Hasil untuk "{query.trim()}"
                            </div>


                            <div className="max-h-[60vh] overflow-y-auto">
                                {searchLoading && (
                                    <div className="px-4 py-6 text-sm text-neutral-500">
                                        Mencari..
                                    </div>
                                )}
                                {!searchLoading && searchResults.length === 0 && (
                                    <div className="px-4 py-6 text-sm text-neutral-500">
                                        Tidak ada hasil yang cocok..
                                    </div>
                                )}

                                {
                                    !searchLoading &&
                                    searchResults.map((item, i) => {
                                        const isActive = i === active
                                        return(
                                            <button
                                                key={item.id || item.slug || i}
                                                onMouseEnter={() => setActive(i)}
                                                onMouseLeave={() => setActive(-1)}
                                                onClick={() => goToNote(item.slug)}
                                                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 ${
                                                    isActive ? 'bg-neutral-50' : ''
                                                    }`}
                                                role="option"
                                                aria-selected={isActive}

                                            >
                                                <div className="mt-0.5 h-6 w-6 rounded-md border border-neutral-200 flex items-center justify-center text-xs
                                                    text-neutral-500 shrink-0
                                                ">
                                                    {i + 1}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-neutral-900 line-clamp-1">
                                                        {item.title || "Untitled"}
                                                    </div>
                                                    <div className="mt-0.5 text-xs text-neutral-500 line-clamp-2">
                                                        /note/{item.slug}
                                                    </div>
                                                    {!!item.content && (
                                                        <div 
                                                            className="mt-1 text-xs text-neutral-600 line-clamp-2"
                                                            dangerouslySetInnerHTML={{ 
                                                                __html: item.content.replace(/<[^>]+>/g, '')
                                                             }}
                                                        />
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })
                                }
                            </div>
                                <div className="px-3 py-2 text-xs text-neutral-500 border-t border-neutral-100 flex items-center justify-between">
                                    <span>Gunakan ↑/↓ lalu enter untuk membuka</span>
                                    <span className="hidden md:block">Esc untuk menutup</span>
                                </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end">
                    {
                        !isAuthenticated() ? (
                            <div className="flex items-center gap-4">
                                <Button
                                    className="block !rounded-md !bg-white !border !border-neutral-600 !px-5 !py-2.5 !text-sm !font-medium !text-neutral transition hover:!bg-(--secondary-color) hover:!text-white"
                                    onClick={() => setShowModalAuth(true)}
                                >
                                    Login
                                </Button>

                                <Button
                                    className="hidden !rounded-md !px-5 !py-2.5 !text-sm !font-medium !text-white !bg-(--secondary-color) transition hover:!bg-(--secondary-dark-color) sm:block"
                                    onClick={() => setShowModalAuth(true)}
                                >
                                    Register
                                </Button>
                            </div>
                        ) : (
                            <Dropdown
                                trigger={['click']}
                                placement="bottomRight"
                                menu={{ items: profileMenuItems, onClick: onProfileMenuClick }}
                            >
                                <button className="flex h-full items-center gap-2 cursor-pointer">
                                    <span className="text-base font-medium leading-none">
                                        Halo, {user?.username || 'User'}
                                    </span>
                                    <Avatar 
                                        size={45}
                                        src={imgUrl(user?.profile_img) || "/assets/profile.png"}
                                    />
                                    <RiArrowDownSFill size={22} className="shrink-0"/>
                                </button>
                            </Dropdown>
                        )
                    }
                </div>
            </div>
            <AuthModal open={showModalAuth} onClose={() => setShowModalAuth(false)} />
        </header>
    )
}

export default dynamic(() => Promise.resolve(Navbar), { ssr: false });