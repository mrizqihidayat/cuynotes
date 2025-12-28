import React, {useState, useEffect, useRef} from 'react'
import { Modal, Input, Avatar, Button, Form, message } from 'antd'
import { useAuth } from '@/store/useAuth'
import { imgUrl } from '@/lib/url'

const PLACEHOLDER_THUMB = '/assets/thumbnail.jpeg'
const PLACEHOLDER_PROFILE = '/assets/profile.png'

export const EditProfileModal = ({ open, onClose }) => {
    const { user, updateProfile } = useAuth()

    const [saving, setSaving] = useState(false);
    const [profileFile, setProfileFile] = useState(null)
    const [thumbnailFile, setThumbnailFile] = useState(null)

    const [profilePreview, setProfilePreview] = useState(
        user?.profile_img ? imgUrl(user?.profile_img) : PLACEHOLDER_PROFILE
    )
        const [thumbnailPreview, setThumbnailPreview] = useState(
        user?.thumbnail_img ? imgUrl(user?.thumbnail_img) : PLACEHOLDER_THUMB
    )

    const profileInputRef = useRef(null)
    const thumbInputRef = useRef(null)

    useEffect(() => {
        if(!profileFile) {
            setProfilePreview(user?.profile_img ? imgUrl(user?.profile_img) : PLACEHOLDER_PROFILE)
        } 
        if(!thumbnailFile){
            setThumbnailPreview(user?.thumbnail_img ? imgUrl(user?.thumbnail_img) : PLACEHOLDER_THUMB)
        }
    }, [user])

    useEffect(() => {
        if(!profileFile) return
        const url = URL.createObjectURL(profileFile)
        setProfilePreview(url)
        return () => URL.revokeObjectURL(url)
    }, [profileFile])

    useEffect(() => {
        if(!thumbnailFile) return
        const url = URL.createObjectURL(thumbnailFile)
        setThumbnailPreview(url)
        return () => URL.revokeObjectURL(url)
    }, [thumbnailFile])

    const onPickImg = (setter) => (e) => {
        const f = e.target.files?.[0]
        if(!f) return
        if(!/image\/(jpe?g|gif)/i.test(f.type)) {
            message.warning('Format gambar harus PNG/JPG/GIF')
            e.target.value = ''
            return
        }
        setter(f)
    }

    const openProfilePicker = () => {
        if(profileInputRef.current) {
            profileInputRef.current.value = ''
            profileInputRef.current.click()
        }
    }

    const openThumbPicker = () => {
        if(thumbInputRef.current) {
            thumbInputRef.current.value = ''
            thumbInputRef.current.click()
        }
    }

    const handleFinish = async(values) => {
        try {
            setSaving(true)

            const {ok, error} = await updateProfile(values, {
                profile: profileFile,
                thumbnail: thumbnailFile
            })

            setSaving(false)
            if(!ok) throw new Error(error || 'Gagal update profile')
            message.success("Profile Berhasil diperbarui")
            onClose?.()
        } catch (error) {
            setSaving(false)
            message.error(error?.message || 'Gagal menyimpan perubahan')
        }
    }

    const formKey = `${user?.id || 'nouser'}-${open ? "open" : "close"}`
  return (
    <Modal
        title={<span className='text-xl font-semibold'>Let's Update Your Profile</span>}
        open={open}
        onCancel={onClose}
        confirmLoading={saving}
        okText="Submit"
        centered
        width={640}
        className='!rounded-2xl'
        styles={{ content: { borderRadius: 16 }, body: { paddingTop: 8 } }}
        okButtonProps={{ form: 'editProfileForm', htmlType: 'submit' }}
    >
        <div className='relative rounded-2xl overflow-hidden border border-neutral-200'>
            <img 
                src={thumbnailPreview || undefined} 
                onError={(e) => {e.currentTarget.src = PLACEHOLDER_THUMB}}
                alt="thumbnail"
                className='h-56 w-full object-cover' 
            />
        </div>

        <div className='mt-4 flex items-center gap-4'>
            <Avatar src={profilePreview || undefined} size={84} />
            <div  className='flex flex-wrap gap-3'>
                <input ref={profileInputRef} type="file" accept='image/png,image/jpeg,image/jpg,image/gif' className='hidden' onChange={onPickImg(setProfileFile)} />
                <Button className='!h-10 !rounded-full !px-4 border-(--secondary-color) !text-(--secondary-color)' onClick={openProfilePicker}>Upload Profile</Button>

                <input ref={thumbInputRef} type="file" accept='image/png,image/jpeg,image/jpg,image/gif' className='hidden' onChange={onPickImg(setThumbnailFile)} />
                <Button className='!h-10 !rounded-full !px-4 border-(--secondary-color) !text-(--secondary-color)' onClick={openThumbPicker}>Upload Thumbnail</Button>
            </div>
        </div>

        <Form
            id='editProfileForm'
            key={formKey}
            layout='vertical'
            className='!mt-6'
            requiredMark={false}
            preserve={false}
            initialValues={{ 
                username: user?.username || '',
                email: user?.email || ''
             }}

             onFinish={handleFinish}
        >
            <Form.Item name="username" rules={[{ required: true, message: "Nama wajib diisi" }]}>
                <Input placeholder='Nama Lengkap' className='!h-12 !rounded-2xl' maxLength={50} /> 
            </Form.Item>

            <Form.Item name="email" rules={[
                { required: true, message: "Email wajib diisi" },
                { type: "email", message: "Email Tidak Valid"}
            ]}>
                <Input placeholder='email@contoh.com' className='!h-12 !rounded-2xl' /> 
            </Form.Item>

        </Form>
    </Modal>
  )
}
