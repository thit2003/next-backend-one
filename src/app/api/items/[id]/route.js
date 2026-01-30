import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("items");

    const item = await collection.findOne({ _id: oid });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await request.json();

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("items");

    const update = { $set: { ...body, updatedAt: new Date() } };
    const result = await collection.updateOne({ _id: oid }, update);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await collection.findOne({ _id: oid });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await request.json();

    // Full document replacement validation
    const { itemName, itemCategory, itemPrice, status } = body || {};
    if (
      !itemName || typeof itemName !== "string" ||
      !itemCategory || typeof itemCategory !== "string" ||
      itemPrice === undefined || typeof itemPrice !== "number" ||
      status === undefined || typeof status !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("items");

    const now = new Date();
    const replacement = { itemName, itemCategory, itemPrice, status, updatedAt: now };

    const result = await collection.replaceOne({ _id: oid }, replacement);
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await collection.findOne({ _id: oid });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("items");

    const result = await collection.deleteOne({ _id: oid });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
