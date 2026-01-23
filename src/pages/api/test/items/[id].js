import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const client = await clientPromise;
  const db = client.db('testdb'); // Replace with your database name
  
  try {
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format' 
      });
    }
    
    switch (req.method) {
      case 'GET':
        // Get single item by ID
        const item = await db.collection('items').findOne({ 
          _id: new ObjectId(id) 
        });
        
        if (!item) {
          return res.status(404).json({ 
            success: false, 
            message: 'Item not found' 
          });
        }
        
        res.status(200).json({ success: true, data: item });
        break;
        
      case 'PUT':
        // Update item
        const updateData = req.body;
        const updateResult = await db.collection('items').updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Item not found' 
          });
        }
        
        res.status(200).json({ 
          success: true, 
          data: updateResult,
          message: 'Item updated successfully'
        });
        break;
        
      case 'DELETE':
        // Delete item
        const deleteResult = await db.collection('items').deleteOne({ 
          _id: new ObjectId(id) 
        });
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Item not found' 
          });
        }
        
        res.status(200).json({ 
          success: true, 
          data: deleteResult,
          message: 'Item deleted successfully'
        });
        break;
        
      default:
        res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}