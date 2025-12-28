import React, {useState, useEffect} from 'react'
import { Modal, Form, Input, Segmented, message } from 'antd';
import { RichTextEditor } from '../RichTextEditor';
import { RiGlobalLine, RiEyeOffLine, RiLockLine } from "react-icons/ri";
import { useNote } from '@/store/useNote';
import { useAuth } from '@/store/useAuth';

function isEmptyHtml (html) {
    const text = (html || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    return text.length === 0
}

export const NoteEditModal = ({ open, onClose, note, onUpdated }) => {
    const [status, setStatus] = useState('public');
    const [loading, setLoading] = useState(false);

    const { token } = useAuth();
    const { update } = useNote();

    useEffect(() => {
        if(!open) {
            setStatus(note?.status || 'public')
        }
    }, [open, note?.status])

    async function onFinishUpdateNote(v) {
        try {
            if(!token) {
                message.warning("Silahkan Login Terlebih Dahulu")
                onClose?.()
                return
            }
            setLoading(true)

            const payload = {
                title: (v.title || "Untitled").trim(),
                content: (v.content || "").trim(),
                status, 
                ...(status === "protected"
                    ? { password: v.password, password_hint: v.password_hint }
                    : {}
                )
            }

            const updated = await update(note?.id, payload)

            message.success("Note Berhasil Dibuat!")
            setStatus('public')
            onUpdated?.(updated)
        } catch (error) {
            setLoading(false)
            message.error(error?.message || "Gagal Membuat Note")
        } finally {
            setLoading(false)
            onClose?.()
        }
    }

    const segmentedList = [
        { label: <span className='inline-flex items-center gap-2'><RiGlobalLine /> Public</span>, value: 'public'},
        { label: <span className='inline-flex items-center gap-2'><RiEyeOffLine /> Private</span>, value: 'private'},
        { label: <span className='inline-flex items-center gap-2'><RiLockLine /> Protected</span>, value: 'protected'},
    ]

    const formKey = `${note?.id || 'note'}-${open ? 'open' : 'closed'}`;

  return (
    <Modal
        title={<span className='text-xl font-semibold'>Edit Your Note</span>}
        open={open}
        onCancel={onClose}
        okText="Save"
        centered
        confirmLoading={loading}
        width={640}
        className='!rounded-2xl'
        styles={{ content: {borderRadius: 16}, body: {paddingTop: 8} }}
        okButtonProps={{ form: "noteEditForm", htmlType: 'submit' }}
    >
        <Form 
            id="noteEditForm"
            key={formKey}
            onFinish={onFinishUpdateNote}
            preserve={false}
            layout='vertical'
            initialValues={{ 
                title: note?.title || '',
                content: note?.content || '',
                password: undefined,
                password_hint: note?.password_hint || undefined
             }}
        >
            <Form.Item label="Judul" name="title">
                <Input placeholder='Judul Catatan (optional)' maxLength={150}/>
            </Form.Item>

            <Form.Item label="Isi Catatan" name="content" valuePropName='value' rules={
                [{
                    validator: (_, value) => 
                        isEmptyHtml(value) 
                        ? Promise.reject(new Error("Isi catatan wajib diisi"))
                        : Promise.resolve()
                }]
            }>
                <RichTextEditor placeholder='Edit Catatanmu...'/>
            </Form.Item>

            <div className='flex items-center justify-between gap-4 '>
                <Form.Item label="Visibilitas" className='mb-0'>
                    <Segmented 
                        value={status}
                        onChange={setStatus}
                        options={segmentedList}
                    />
                </Form.Item>

                {status === "protected" && (
                    <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-3'>
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[{ required: true, message: "Password Wajib Diisi!!"}]}
                            className='mb-0'  
                        >
                            <Input.Password placeholder='Masukkan password akses'/>
                        </Form.Item>

                        <Form.Item
                            name="password_hint" label="Hint (optional)" className='mb-0'
                        >
                            <Input placeholder='Contoh: Tanggal Jadian'/>
                        </Form.Item>
                    </div>
                )}                
            </div>
        </Form>

    </Modal>
  )
}
