import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("users");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 10;

    const skip = (safePage - 1) * safeLimit;

    const total = await collection.countDocuments({});
    const users = await collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .toArray();

    return NextResponse.json({
      data: users,
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function validateUser(payload) {
  const errors = [];
  const { name, email, role, status } = payload || {};

  if (!name || typeof name !== "string") errors.push("name is required (string)");
  if (!email || typeof email !== "string") errors.push("email is required (string)");
  if (!role || typeof role !== "string") errors.push("role is required (string)");
  if (status === undefined || typeof status !== "string") errors.push("status is required (string)");

  return errors;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const errors = validateUser(body);
    if (errors.length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("users");

    const now = new Date();
    const doc = { ...body, createdAt: now, updatedAt: now };

    const result = await collection.insertOne(doc);
    const inserted = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
