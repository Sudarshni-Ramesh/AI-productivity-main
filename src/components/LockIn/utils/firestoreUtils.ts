import { doc, setDoc, Timestamp, collection, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export interface ClockedEvent {
  taskDescription: string;
  projectType: string;
  startTime: Date;
  endTime: Date | null;
  id: string;
  name: string | null;
}

export const insertOrUpdateEventData = async (userId: string, eventData: ClockedEvent): Promise<void> => {
  try {
    const eventRef = doc(db, `user_events/${userId}/clockedEvents/${eventData.id}`);

    // Prepare the event data with Firestore-compatible timestamps
    const eventPayload = {
      taskDescription: eventData.taskDescription,
      projectType: eventData.projectType,
      startTime: Timestamp.fromDate(eventData.startTime),
      endTime: eventData.endTime ? Timestamp.fromDate(eventData.endTime) : null,
      name: eventData.name,
    };

    // Insert the document into Firestore
    await setDoc(eventRef, eventPayload);

    console.log('Clocked event successfully added!');
  } catch (error) {
    console.error('Error inserting clocked event: ', error);
  }
};

export const listenToFirestoreCollection = (
    userId: string,
    callback: (data: any[]) => void
  ) => {
    const unsubscribe = onSnapshot(collection(db, `user_events/${userId}/clockedEvents/`), (snapshot) => {
      const newData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(newData); // Pass the data to the callback function provided by the component
    });
  
    return unsubscribe; // Return the unsubscribe function to be handled by the component
  };
export const getAllClockedEvents = async (userId: string): Promise<ClockedEvent[]> => {
  try {
    const eventsCollectionRef = collection(db, `user_events/${userId}/clockedEvents`);
    const querySnapshot = await getDocs(eventsCollectionRef);

    const events: ClockedEvent[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        taskDescription: data.taskDescription,
        projectType: data.projectType,
        startTime: data.startTime.toDate(),
        endTime: data.endTime ? data.endTime.toDate() : null,
        id: doc.id,
        name: doc.name ? doc.name : null
      };
    })

    return events;
  } catch (error) {
    console.error('Error fetching clocked events: ', error);
    return [];
  }

};

export const deleteEventData = async (userId: string, eventId: string): Promise<void> => {
    try {
      const eventRef = doc(db, `user_events/${userId}/clockedEvents/${eventId}`);
      await deleteDoc(eventRef);
      console.log('Clocked event successfully deleted!');
    } catch (error) {
      console.error('Error deleting clocked event: ', error);
    }
  };
