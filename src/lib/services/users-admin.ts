import { Timestamp } from 'firebase-admin/firestore';
import type { UserProfile } from '@/lib/types';
import { getAdminServices } from '../firebase-admin';

export async function updateUserDocument(uid: string, data: Partial<Omit<UserProfile, 'uid'>>) {
    const { db } = getAdminServices();
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.update(data);
}

export async function getAllUsersAdmin(): Promise<UserProfile[]> {
    const { db } = getAdminServices();
    const usersCollection = db.collection('users');
    const querySnapshot = await usersCollection.get();
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        } as UserProfile;
    });
}
