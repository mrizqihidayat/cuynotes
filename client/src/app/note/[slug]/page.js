'use client'

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Modal, Input, message, Spin, Button } from "antd"
import { useAuth } from '@/store/useAuth';
import { colors } from '@/constants/colors';
import { colorForNote } from '@/utils/color';
import CardNote from '@/components/CardNote';
import { useFavorite } from '@/store/useFavorite';
import { useNote } from '@/store/useNote';

export default function NoteDetailPage() {
    const params = useParams()
    const slug = decodeURIComponent(params?.slug ?? '')
    const router = useRouter()

    const { token, isAuthenticated } = useAuth(); 
    const loggedIn = isAuthenticated?.() ?? !!token

    const loadFavIds = useFavorite(s => s.loadIds)

    const { detail: note, loadDetail, clearDetail, loading, error } = useNote()

    const [needPassword, setNeedPassword] = useState(false)
    const [password, setPassword] = useState('')
    const [passwordHint, setPasswordHint] = useState('')
    const [passError, setPassError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [attempts, setAttempts] = useState(0)
    const [showHint, setShowHint] = useState(false)

    useEffect(() => {
        if(!loggedIn) router.replace('/?auth=1')
    }, [loggedIn, router])

    useEffect(() => {
        if(token) loadFavIds().catch(() => {})
    }, [token, loadFavIds])

    useEffect(() => {
        if(!loggedIn || !slug) return
        loadDetail(slug).then(res => {
            if(!res.ok && /Password/i.test(res.error)) {
                setNeedPassword(true)
            }
        })
        return () => clearDetail();
    }, [slug, loggedIn, loadDetail, clearDetail])

    const bg = useMemo(() => colorForNote(Math.random(), colors), [note])

    const handleSubmitPassword = async () => {
        if(!password.trim()) return message.warning("Masukkan Password")
        setSubmitting(true)

        try {
            const res = await loadDetail(slug, password.trim())

            if(res.ok) {
                setPassword('')
                setNeedPassword(false)
                setPassError('')
                setAttempts(0)
                setShowHint(false)
                setPasswordHint(res?.data?.password_hint || '')
            } else {
                setNeedPassword(true)
                setAttempts(prev => {
                    const next = prev+1
                    if (next >= 3) setShowHint(true)
                    return next
                })
                if(/Invalid|Wrong/i.test(res.error)){
                    setPassError('Password Salah, coba lagi.')
                }

                const hinted = res?.data?.password_hint || note?.password_hint || passwordHint
                setPasswordHint(hinted || '')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSubmitting(false)
        }
    }

    if(!loggedIn) return null
    if(loading && !needPassword) {
        return (
            <div className='py-10 text-center text-sm text-neutral-500'>
                <Spin />
            </div>
        )
    }

    if(error && !needPassword) {
        return (
            <div className='py-10 text-center text-sm text-red-500'>{error}</div>
        )
    }
    return (
        <>
            <div className='max-w-3xl mx-auto'>
                {note && (
                    <CardNote 
                        note={note}
                        bg={bg}
                        showPrivateIcon
                    />
                )}
            </div>

            <Modal
                open={needPassword}
                title={<span className='text-lg font-semibold'>Masukkan Password</span>}
                maskClosable={false}
                closable={false}
                keyboard={false}
                onCancel={() => {}}
                footer={[
                    <Button key="back" onClick={() => router.back()}>
                        Kembali
                    </Button>,
                    <Button
                        key='submit'
                        type='primary'
                        loading={submitting}
                        onClick={handleSubmitPassword}
                    >
                        Buka
                    </Button>
                ]}
                centered
                width={420}
            >
                {passError && (
                    <div className='text-sm text-red-500 mb-2'>
                        {passError}{' '}
                        {attempts > 0 && Math.max(0, 3 - attempts) > 0
                        ? `(Kesempatan tersisa ${Math.max(0, 3 - attempts)}x)`
                        : null
                        }
                    </div>
                )}

                <Input.Password 
                    placeholder='Password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onPressEnter={handleSubmitPassword}
                    status={passError ? 'error' : ''}
                />

                {showHint && passwordHint ? (
                    <p className='text-xs text-neutral-600 mt-2'>
                        <span className='font-medium'>Hint: </span> {passwordHint}
                    </p>
                ) : null}
            </Modal>
        </>
    )
}