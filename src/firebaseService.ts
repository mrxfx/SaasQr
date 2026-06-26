import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, isConfigured } from './firebase';
import { Shop, Order, Coupon, SystemSettings, SupportTicket } from './types';

// Generic CRUD helpers that handle isConfigured checks
export const firebaseService = {
  // --- SHOPS ---
  async getShops(): Promise<Shop[] | null> {
    if (!isConfigured || !db) return null;
    try {
      const snap = await getDocs(collection(db, 'shops'));
      return snap.docs.map(doc => doc.data() as Shop);
    } catch (e) {
      console.error('Error fetching shops from Firestore:', e);
      return null;
    }
  },

  async saveShop(shop: Shop): Promise<boolean> {
    if (!isConfigured || !db) return false;
    try {
      await setDoc(doc(db, 'shops', shop.id), shop);
      return true;
    } catch (e) {
      console.error('Error saving shop to Firestore:', e);
      return false;
    }
  },

  async deleteShop(shopId: string): Promise<boolean> {
    if (!isConfigured || !db) return false;
    try {
      await deleteDoc(doc(db, 'shops', shopId));
      return true;
    } catch (e) {
      console.error('Error deleting shop from Firestore:', e);
      return false;
    }
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[] | null> {
    if (!isConfigured || !db) return null;
    try {
      const snap = await getDocs(collection(db, 'orders'));
      return snap.docs.map(doc => doc.data() as Order);
    } catch (e) {
      console.error('Error fetching orders from Firestore:', e);
      return null;
    }
  },

  async saveOrder(order: Order): Promise<boolean> {
    if (!isConfigured || !db) return false;
    try {
      await setDoc(doc(db, 'orders', order.id), order);
      return true;
    } catch (e) {
      console.error('Error saving order to Firestore:', e);
      return false;
    }
  },

  // --- COUPONS ---
  async getCoupons(): Promise<Coupon[] | null> {
    if (!isConfigured || !db) return null;
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      return snap.docs.map(doc => doc.data() as Coupon);
    } catch (e) {
      console.error('Error fetching coupons from Firestore:', e);
      return null;
    }
  },

  async saveCoupon(coupon: Coupon): Promise<boolean> {
    if (!isConfigured || !db) return false;
    try {
      await setDoc(doc(db, 'coupons', coupon.code), coupon);
      return true;
    } catch (e) {
      console.error('Error saving coupon to Firestore:', e);
      return false;
    }
  },

  async deleteCoupon(code: string): Promise<boolean> {
    if (!isConfigured || !db) return false;
    try {
      await deleteDoc(doc(db, 'coupons', code));
      return true;
    } catch (e) {
      console.error('Error deleting coupon from Firestore:', e);
      return false;
    }
  },

  // --- SETTINGS ---
  async getSettings(): Promise<SystemSettings | null> {
    if (!isConfigured || !db) return null;
    try {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) {
        return snap.data() as SystemSettings;
      }
      return null;
    } catch (e) {
      console.error('Error fetching settings from Firestore:', e);
      return null;
    }
  },

  async saveSettings(settings: SystemSettings): Promise<boolean> {
    if (!isConfigured || !db) return false;
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      return true;
    } catch (e) {
      console.error('Error saving settings to Firestore:', e);
      return false;
    }
  },

  // --- SUPPORT TICKETS ---
  async getTickets(): Promise<SupportTicket[] | null> {
    if (!isConfigured || !db) return null;
    try {
      const snap = await getDocs(collection(db, 'tickets'));
      return snap.docs.map(doc => doc.data() as SupportTicket);
    } catch (e) {
      console.error('Error fetching tickets from Firestore:', e);
      return null;
    }
  },

  async saveTicket(ticket: SupportTicket): Promise<boolean> {
    if (!isConfigured || !db) return false;
    try {
      await setDoc(doc(db, 'tickets', ticket.id), ticket);
      return true;
    } catch (e) {
      console.error('Error saving ticket to Firestore:', e);
      return false;
    }
  }
};
