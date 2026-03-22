import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';
import * as dotenv from 'dotenv';

dotenv.config();

const DOCS_DIR = './docs/knowledge base';
const INDEX_NAME = process.env.PINECONE_INDEX || 'thrustlab-rag';

async function loadMarkdownFiles(dirPath: string): Promise<Document[]> {
  const documents: Document[] = [];
  
  async function readDirectory(currentPath: string) {
    const entries = await readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        await readDirectory(fullPath);
      } else if (entry.name.endsWith('.md')) {
        const content = await readFile(fullPath, 'utf-8');
        documents.push(
          new Document({
            pageContent: content,
            metadata: { source: entry.name }
          })
        );
      }
    }
  }
  
  await readDirectory(dirPath);
  return documents;
}

export const runIngestion = async () => {
  console.log('🚀 Starting Ingestion Pipeline...');

  if (!process.env.PINECONE_API_KEY || !process.env.HUGGINGFACE_API_KEY) {
    throw new Error('Missing API Keys in .env');
  }

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const existingIndexes = await pinecone.listIndexes();
  const indexExists = existingIndexes.indexes?.some(i => i.name === INDEX_NAME);

  if (!indexExists) {
    console.log(`Creating index: ${INDEX_NAME}`);
    await pinecone.createIndex({
      name: INDEX_NAME,
      dimension: 1024,
      metric: 'cosine',
      spec: { serverless: { cloud: 'aws', region: 'us-east-1' } }
    });
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  const pineconeIndex = pinecone.Index(INDEX_NAME);

  console.log(`Loading Markdown files from ${DOCS_DIR}...`);
  const rawDocs = await loadMarkdownFiles(DOCS_DIR);
  console.log(`Loaded ${rawDocs.length} documents.`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.splitDocuments(rawDocs);
  console.log(`Generated ${docs.length} semantic chunks.`);

  console.log('Generating embeddings and upserting to Pinecone...');
  await PineconeStore.fromDocuments(
    docs,
    new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: 'BAAI/bge-large-en-v1.5',
    }),
    {
      pineconeIndex,
    }
  );

  console.log('✅ Ingestion Complete.');
};

runIngestion().catch((error) => {
  console.error('❌ Ingestion Failed:', error);
  process.exit(1);
});
