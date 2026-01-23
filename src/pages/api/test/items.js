import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('testdb'); // your database name
  
  try {
    switch (req.method) {
      case 'GET':
        // Get all items
        const items = await db.collection('items').find({}).toArray();
        res.status(200).json({ success: true, data: items });
        break;
        
      case 'POST':
        // Create new item
        const newItem = req.body;
        const result = await db.collection('items').insertOne(newItem);
        res.status(201).json({ success: true, data: result });
        break;
        
      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}