import admin, { firestore } from 'firebase-admin';
import { User } from './types';
import DocumentData = firestore.DocumentData;

admin.initializeApp({
  credential: admin.credential.cert('firestore-credentials.json'),
});

const db = admin.firestore();

const getCollection = async <T extends DocumentData>(
  collectionName: string,
): Promise<T[]> => {
  const collection = await db.collection(collectionName).get();
  return collection.docs.map((doc) => doc.data() as T);
};

const getDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
): Promise<T | null> => {
  const doc = await db.collection(collectionName).doc(docId).get();
  return doc.exists ? (doc.data() as T) : null;
};

export const getUsers = async () => {
  return await getCollection<User>('users');
};

export const getOrCreateUser = async (userId: string, name: string) => {
  let user = await getDocument<User>('users', userId);
  if (user) {
    return user;
  }
  const newUser: User = {
    id: userId,
    audioBytes: 0,
    audioCount: 0,
    audioSeconds: 0,
    country: 'ar', // TODO: check phone
    isFree: false,
    isPremium: false,
    language: 'es', // TODO: check phone
    lastPaid: null,
    lastUpdated: null,
    created: new Date().toISOString(),
    name,
    phoneNumber: userId,
    phoneNumberOriginal: userId,
    tokensUsed: 0,
    timesUsed: 0,
  };
  await db.collection('users').doc(userId).set(newUser);
  return await getDocument<User>('users', userId);
};

export const updateTokensUsed = async (
  userId: string,
  tokensUsed: number,
  isAudio?: boolean,
) => {
  let user = await getDocument<User>('users', userId);
  if (!user) {
    return;
  }

  await db
    .collection('users')
    .doc(userId)
    .update({
      tokensUsed: (user.tokensUsed || 0) + tokensUsed,
      lastUpdated: new Date().toISOString(),
      timesUsed: (user.timesUsed || 0) + 1,
      ...(isAudio && {
        audioCount: (user.audioCount || 0) + 1,
      }),
    });
};
