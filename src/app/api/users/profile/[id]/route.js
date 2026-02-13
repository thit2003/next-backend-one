import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { unlink } from "fs/promises";
import { join } from "path";

function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

// GET user profile by ID
export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("users");

    const user = await collection.findOne({ _id: oid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user profile with relevant fields
    const profile = {
      _id: user._id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      profileImage: user.profileImage || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH update user profile
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const { firstName, lastName, email, profileImage } = body;

    // Validate required fields
    const errors = [];
    if (firstName !== undefined && (!firstName || typeof firstName !== "string")) {
      errors.push("firstName must be a non-empty string");
    }
    if (lastName !== undefined && (!lastName || typeof lastName !== "string")) {
      errors.push("lastName must be a non-empty string");
    }
    if (email !== undefined && (!email || typeof email !== "string")) {
      errors.push("email must be a non-empty string");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("users");

    // Check if user exists and get old profile image
    const existingUser = await collection.findOne({ _id: oid });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update object
    const updateData = { updatedAt: new Date() };
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    // If a new profile image is being set and there was an old one, delete the old file
    if (
      profileImage &&
      existingUser.profileImage &&
      profileImage !== existingUser.profileImage
    ) {
      try {
        const oldFilename = existingUser.profileImage.split("/").pop();
        const oldFilePath = join(process.cwd(), "public", "uploads", oldFilename);
        await unlink(oldFilePath);
      } catch (err) {
        console.warn("Failed to delete old profile image:", err.message);
      }
    }

    // Update user profile
    const result = await collection.updateOne(
      { _id: oid },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch and return updated profile
    const updatedUser = await collection.findOne({ _id: oid });
    const profile = {
      _id: updatedUser._id,
      firstName: updatedUser.firstName || "",
      lastName: updatedUser.lastName || "",
      email: updatedUser.email || "",
      profileImage: updatedUser.profileImage || null,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return NextResponse.json(profile);
  } catch (err) {
    console.error("Error updating profile:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE profile image only
export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("users");

    const user = await collection.findOne({ _id: oid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete profile image file if exists
    if (user.profileImage) {
      try {
        const filename = user.profileImage.split("/").pop();
        const filePath = join(process.cwd(), "public", "uploads", filename);
        await unlink(filePath);
      } catch (err) {
        console.warn("Failed to delete profile image file:", err.message);
      }
    }

    // Remove profile image from database
    await collection.updateOne(
      { _id: oid },
      { $set: { profileImage: null, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: "Profile image deleted" });
  } catch (err) {
    console.error("Error deleting profile image:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
