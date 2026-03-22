import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';
import fs from 'fs';
import path from 'path';
import { eq } from 'drizzle-orm';

// Load .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            let value = valueParts.join('=');
            value = value.trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            if (value.startsWith("'") && value.endsWith("'")) {
                value = value.slice(1, -1);
            }
            process.env[key.trim()] = value;
        }
    });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

const modules = schema.modules;
const questions = schema.questions;

const moduleData = [
    {
        id: 1,
        title: 'History of Gas Turbine Engines',
        description: 'Ready for takeoff? Test how well you understand the core principles and history that keep jets soaring through the skies.',
        icon: '🚀',
        questions: [
            {
                text: 'Which of the following best describes the principle of jet propulsion?',
                options: [
                    'The conversion of fuel into mechanical energy by a reciprocating motion',
                    'The force is generated in the same direction as the exhaust gases',
                    'The force is produced opposite to the discharge of fluid under pressure',
                    'The suction of air to create a vacuum thrust'
                ],
                correctAnswerIndex: 2
            },
            {
                text: "Jet propulsion operates according to which of Newton's Laws of Motion?",
                options: ['First Law', 'Second Law', 'Third Law', 'Fourth Law'],
                correctAnswerIndex: 2
            },
            {
                text: 'Who devised the aeolipile, an early steam-powered toy demonstrating jet propulsion?',
                options: ['Isaac Newton', 'John Barber', 'Hero of Alexandria', 'Frank Whittle'],
                correctAnswerIndex: 2
            },
            {
                text: 'Who was granted the first patent covering a gas turbine in 1791?',
                options: ['Sanford Moss', 'John Barber', 'Hans von Ohain', 'Frank Whittle'],
                correctAnswerIndex: 1
            },
            {
                text: 'What was Dr. Sanford Moss known for in the early 1900s?',
                options: [
                    'Building the first supersonic jet',
                    'Developing the first successful turbojet',
                    'Creating the turbo-supercharger driven by exhaust gases',
                    'Designing the first commercial jetliner'
                ],
                correctAnswerIndex: 2
            },
            {
                text: 'Frank Whittle developed the first successful turbojet engine and received his patent in what year?',
                options: ['1925', '1930', '1936', '1941'],
                correctAnswerIndex: 1
            },
            {
                text: 'The Heinkel He-178, recognized as the first jet-propelled aircraft, was designed by:',
                options: ['Frank Whittle', 'Hans von Ohain', 'John Barber', 'Sanford Moss'],
                correctAnswerIndex: 1
            },
            {
                text: 'Which type of jet engine has no moving parts and relies on forward motion to compress incoming air?',
                options: ['Pulse Jet', 'Ramjet', 'Scramjet', 'Turbojet'],
                correctAnswerIndex: 1
            },
            {
                text: 'In a scramjet engine, combustion occurs in:',
                options: ['Subsonic airflow', 'Supersonic airflow', 'Static airflow', 'Rotating airflow'],
                correctAnswerIndex: 1
            },
            {
                text: 'Which of the following jet engines does not rely on atmospheric air for propulsion?',
                options: ['Gas turbine engine', 'Ramjet', 'Scramjet', 'Rocket engine'],
                correctAnswerIndex: 3
            }
        ]
    },
    {
        id: 2,
        title: 'Types of Gas Turbine Engines',
        description: 'Think you know your engines? Explore the different types, layouts, and designs that power aircraft around the world.',
        icon: '⚙️',
        questions: [
            {
                text: 'Which of the following best describes a turbojet engine?',
                options: [
                    'Converts almost all energy into shaft horsepower',
                    'Drives a propeller through reduction gears',
                    'Produces thrust by accelerating exhaust gases through a nozzle',
                    'Uses a free power turbine to drive a shaft'
                ],
                correctAnswerIndex: 2
            },
            {
                text: 'The engine pressure ratio (EPR) in a turbojet engine is the ratio between:',
                options: [
                    'Compressor inlet temperature and turbine inlet temperature',
                    'Turbine discharge pressure and inlet air pressure',
                    'Compressor discharge pressure and turbine inlet pressure',
                    'Exhaust pressure and compressor discharge pressure'
                ],
                correctAnswerIndex: 1
            },
            {
                text: 'What is a "spool" in a turbojet engine?',
                options: [
                    'A device that measures engine performance',
                    'A turbine and compressor mounted on the same shaft',
                    'The propeller gearbox unit',
                    'The exhaust nozzle assembly'
                ],
                correctAnswerIndex: 1
            },
            {
                text: 'In a turboprop engine, the main power output is delivered to:',
                options: [
                    'The jet nozzle',
                    'The propeller via a reduction gear system',
                    'The turbine only',
                    'The free power turbine'
                ],
                correctAnswerIndex: 1
            },
            {
                text: 'Why is reduction gearing necessary in turboprop engines?',
                options: [
                    'To increase thrust by accelerating exhaust gases',
                    'To allow the propeller to operate at slower, more efficient speeds',
                    'To improve fuel injection timing',
                    'To control air intake pressure'
                ],
                correctAnswerIndex: 1
            },
            {
                text: 'The total output of a turboprop engine, combining shaft horsepower and residual jet thrust, is called:',
                options: [
                    'Brake horsepower',
                    'Total engine power (TEP)',
                    'Equivalent Shaft Horsepower (ESHP)',
                    'Effective Thrust Power (ETP)'
                ],
                correctAnswerIndex: 2
            },
            {
                text: 'A turboshaft engine differs from a turboprop mainly because it:',
                options: [
                    'Produces thrust through a nozzle',
                    'Drives a helicopter rotor or other mechanical load via a shaft',
                    'Has no turbine stages',
                    'Uses a ducted fan instead of a propeller'
                ],
                correctAnswerIndex: 1
            },
            {
                text: 'In a turboshaft engine, the free power turbine:',
                options: [
                    'It is mechanically connected to the compressor',
                    'Converts remaining gas energy into mechanical shaft power',
                    'Increases air pressure before combustion',
                    'It is used only during startup'
                ],
                correctAnswerIndex: 1
            },
            {
                text: 'The main difference between turboprop and turboshaft engines is that:',
                options: [
                    'Turboshaft engines produce more exhaust thrust',
                    'Turboprop engines drive helicopter rotors',
                    'Turboprops may produce some thrust from exhaust, while turboshafts primarily produce shaft power',
                    'Turboshafts are designed for supersonic flight'
                ],
                correctAnswerIndex: 2
            },
            {
                text: 'Ducted and unducted propfan engines are advanced designs that:',
                options: [
                    'Operate at subsonic speeds only',
                    'Use composite materials for lighter, faster blades',
                    'Have lower fuel efficiency than turbofans',
                    'Cannot exceed Mach 0.7'
                ],
                correctAnswerIndex: 1
            }
        ]
    },
    {
        id: 3,
        title: 'Sections of a Gas Turbine Engine',
        description: 'Time to get hands-on! Identify the key parts and their functions that make up a powerful jet engine.',
        icon: '🔧',
        questions: [
            {
                text: 'Which of the following components belong to the cold section of a gas turbine engine?',
                options: [
                    'Turbine and Exhaust',
                    'Air Inlet and Compressor',
                    'Combustion and Turbine',
                    'Compressor and Exhaust'
                ],
                correctAnswerIndex: 1
            },
            {
                text: 'The main function of the air inlet is to:',
                options: [
                    'Increase the speed of exhaust gases',
                    'Convert pressure energy into velocity energy',
                    'Recover total pressure and deliver uniform airflow to the compressor',
                    'Supply fuel to the combustion chamber'
                ],
                correctAnswerIndex: 2
            },
            {
                text: 'Which type of air inlet is specifically designed for stationary or slow-moving aircraft such as helicopters or test stands?',
                options: [
                    'Supersonic inlet',
                    'Subsonic inlet',
                    'Bellmouth inlet',
                    'Variable geometry inlet'
                ],
                correctAnswerIndex: 2
            },
            {
                text: 'The compressor pressure ratio is defined as:',
                options: [
                    'Inlet pressure ÷ Outlet pressure',
                    'Outlet pressure ÷ Inlet pressure',
                    'Turbine pressure ÷ Compressor pressure',
                    'Air velocity ÷ Pressure energy'
                ],
                correctAnswerIndex: 1
            },
            {
                text: 'What is the primary function of the compressor section?',
                options: [
                    'Convert fuel into energy',
                    'Supply compressed air for combustion',
                    'Cool the turbine blades',
                    'Direct exhaust gases rearward'
                ],
                correctAnswerIndex: 1
            },
            {
                text: 'Which of the following is an advantage of a centrifugal flow compressor?',
                options: [
                    'Large frontal area',
                    'High manufacturing cost',
                    'Low weight and simplicity in design',
                    'Requires high starting power'
                ],
                correctAnswerIndex: 2
            },
            {
                text: 'In an axial flow compressor, each pair of rotor and stator vanes is called a:',
                options: ['Stage', 'Section', 'Spool', 'Passage'],
                correctAnswerIndex: 0
            },
            {
                text: 'The combustion chamber mixes and burns the air-fuel mixture. What percentage of air is approximately used as primary air for combustion?',
                options: ['10–20%', '25–35%', '45–55%', '65–75%'],
                correctAnswerIndex: 1
            },
            {
                text: 'Which type of turbine blade produces turning force mainly by aerodynamic action and pressure drop across the blades?',
                options: ['Impulse blade', 'Reaction blade', 'Impulse-reaction blade', 'Shrouded blade'],
                correctAnswerIndex: 1
            },
            {
                text: 'The accessory section of a gas turbine engine provides power for:',
                options: [
                    'Thrust production only',
                    'Fuel pumps, generators, and hydraulic systems',
                    'Compressor cooling only',
                    'Turbine speed regulation'
                ],
                correctAnswerIndex: 1
            }
        ]
    }
];

async function seed() {
    console.log('Seeding database...');

    for (const mod of moduleData) {
        console.log(`Inserting module: ${mod.title}`);

        // Insert module
        const [insertedModule] = await db.insert(modules).values({
            moduleNo: mod.id,
            moduleName: mod.title
        }).onConflictDoUpdate({
            target: modules.moduleNo,
            set: { moduleName: mod.title }
        }).returning();

        // Ensure deterministic seeding: replace existing questions for this module.
        await db.delete(questions).where(eq(questions.moduleNo, insertedModule.moduleNo));

        // Insert questions
        for (const q of mod.questions) {
            await db.insert(questions).values({
                moduleNo: insertedModule.moduleNo,
                questionText: q.text,
                options: q.options,
                correctAnswer: q.options[q.correctAnswerIndex] // Store the text of the correct answer
            });
        }
    }

    console.log('Seeding complete!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
