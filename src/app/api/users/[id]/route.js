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
    const collection = db.collection("users");

    const user = await collection.findOne({ _id: oid });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(user);
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
    const collection = db.collection("users");

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
    const { name, email, role, status } = body || {};
    if (
      !name || typeof name !== "string" ||
      !email || typeof email !== "string" ||
      !role || typeof role !== "string" ||
      status === undefined || typeof status !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("users");

    const now = new Date();
    const replacement = { name, email, role, status, updatedAt: now };

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
    const collection = db.collection("users");

    const result = await collection.deleteOne({ _id: oid });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
