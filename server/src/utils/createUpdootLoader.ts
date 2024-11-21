import DataLoader from 'dataloader';
import { Updoot } from '../entities/Updoot';

export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.find({
        where: keys.map((key) => ({
          postId: key.postId,
          userId: key.userId,
        })),
      });

      const updootIdsToUpdoot: Record<string, Updoot> = {};
      updoots.forEach((u) => {
        const compositeKey = `${u.postId}-${u.userId}`;
        updootIdsToUpdoot[compositeKey] = u;
      });

      return keys.map((key) => {
        const compositeKey = `${key.postId}-${key.userId}`;
        return updootIdsToUpdoot[compositeKey] || null;
      });
    }
  );
