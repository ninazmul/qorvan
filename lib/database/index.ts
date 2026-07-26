import mongoose, { ConnectOptions } from "mongoose";
import "./models/user.model";
import "./models/media.model";
import "./models/setting.model";
import "./models/heroSlide.model";
import "./models/contactMessage.model";
import "./models/category.model";
import "./models/collection.model";
import "./models/brand.model";
import "./models/product.model";
import "./models/deliveryZone.model";
import "./models/coupon.model";
import "./models/order.model";
import "./models/productReview.model";
import "./models/blog.model";
import "./models/returnRequest.model";
import "./models/wishlist.model";


const MONGODB_URI = process.env.MONGODB_URI;

mongoose.set("returnDocument", "after");
mongoose.set("strictQuery", false);

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedConnection | undefined;
}

const cached: CachedConnection = global.mongoose || {
  conn: null,
  promise: null,
};

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URI, {
      dbName: "qorvan",
      bufferCommands: false,
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
    } as ConnectOptions);

  try {
    cached.conn = await cached.promise;
    if (process.env.NODE_ENV !== "production") {
      console.log("✅ MongoDB connected");
    }
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    cached.conn = null;
    cached.promise = null;
    throw err;
  }

  global.mongoose = cached;

  return cached.conn;
};
