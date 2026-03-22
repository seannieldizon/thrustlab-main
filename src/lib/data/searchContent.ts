// Searchable content index for all module pages
import type { SearchResult } from '$lib/stores/searchStore';

export const MODULE_CONTENT: SearchResult[] = [
    // Module 1: History of Gas Turbine Engines
    {
        title: 'Principle of Jet Propulsion',
        content: 'Isaac Newton Third Law Motion force acting body opposite equal reaction. Jet propulsion force generated opposite direction discharge fluid pressure escaping opening. Whatever form device utilizes jet propulsion essentially reaction engine operates according Sir Isaac Newton Third Law Motion.',
        url: '/hangar-zone/module/history?page=1',
        module: 'Module 01: History',
        section: 'Principle of Jet Propulsion',
        matchScore: 0
    },
    {
        title: 'History of Jet Propulsion - Aeolipile',
        content: '250 BC writer mathematician Hero devised toy used reaction principle. toy called aeolipile consisted covered kettle water heated produce steam.',
        url: '/hangar-zone/module/history?page=1',
        module: 'Module 01: History',
        section: 'History - 250 B.C.',
        matchScore: 0
    },
    {
        title: 'Hot Air Engine',
        content: '1500s Leonardo da Vinci designed hot air engine chimney jack revolving spit. Used principle hot air rises heated smoke fire caused fan rotate turning spit.',
        url: '/hangar-zone/module/history?page=1',
        module: 'Module 01: History',
        section: 'History - 1500s',
        matchScore: 0
    },
    {
        title: 'Jet Propulsion Theory',
        content: '1687 Sir Isaac Newton formulated laws governing motion matter stated Third Law Motion. Frank Whittle English aviation engineer and pilot invented turbojet engine.',
        url: '/hangar-zone/module/history?page=2',
        module: 'Module 01: History',
        section: 'Theory and Invention',
        matchScore: 0
    },
    {
        title: 'Early Jet Aircraft',
        content: 'Heinkel He 178 first aircraft fly purely using turbojet engine August 1939. Messerschmitt Me 262 first operational jet fighter aircraft service history.',
        url: '/hangar-zone/module/history?page=3',
        module: 'Module 01: History',
        section: 'Early Aircraft',
        matchScore: 0
    },
    {
        title: 'Modern Jet Engines',
        content: 'Modern turbofan engines high bypass ratio efficient quieter earlier turbojets. Used commercial aviation military applications worldwide.',
        url: '/hangar-zone/module/history?page=4',
        module: 'Module 01: History',
        section: 'Modern Engines',
        matchScore: 0
    },

    // Module 2: Types of Gas Turbine Engines
    {
        title: 'Turbojet Engine',
        content: 'Turbojet basic operating principles straight forward. Air compressed compressor burned combustion chamber expands spins turbine turn drives compressor self-sustaining leaves exhaust high velocities. difference velocity inlet exit produces thrust. EPR engine pressure ratio ratio turbine discharge pressure inlet air pressure.',
        url: '/hangar-zone/module/types?page=1',
        module: 'Module 02: Types',
        section: 'Turbojet',
        matchScore: 0
    },
    {
        title: 'Airflow Through Turbojet',
        content: 'Air enters inlet compressed compressor mixed fuel combustion chamber ignited. Hot gases expand through turbine drive compressor exit nozzle high velocity create thrust.',
        url: '/hangar-zone/module/types?page=1',
        module: 'Module 02: Types',
        section: 'Turbojet Airflow',
        matchScore: 0
    },
    {
        title: 'Turboprop Engine',
        content: 'Turboprop engine uses gas turbine core drive propeller. Most thrust produced propeller small amount thrust exhaust gases. Efficient lower speeds altitudes.',
        url: '/hangar-zone/module/types?page=2',
        module: 'Module 02: Types',
        section: 'Turboprop',
        matchScore: 0
    },
    {
        title: 'Turbofan Engine',
        content: 'Turbofan engine ducted fan driven gas turbine. Fan located front engine accelerates air around engine core bypass duct. Higher bypass ratio more efficient quieter. Used most commercial aircraft.',
        url: '/hangar-zone/module/types?page=2',
        module: 'Module 02: Types',
        section: 'Turbofan',
        matchScore: 0
    },
    {
        title: 'Turboshaft Engine',
        content: 'Turboshaft engine delivers power output shaft rather thrust exhaust. Used helicopters power generation industrial applications. Gas turbine drives power turbine connected output shaft.',
        url: '/hangar-zone/module/types?page=3',
        module: 'Module 02: Types',
        section: 'Turboshaft',
        matchScore: 0
    },
    {
        title: 'Ramjet Engine',
        content: 'Ramjet simplest jet engine no moving parts. Uses forward motion compress air. Only works high speeds. Used missiles high-speed aircraft.',
        url: '/hangar-zone/module/types?page=3',
        module: 'Module 02: Types',
        section: 'Ramjet',
        matchScore: 0
    },
    {
        title: 'Pulse Jet Engine',
        content: 'Pulsejet mechanically simple valved duct burns fuel intermittent combustion. Used V-1 flying bombs World War II. Simple but inefficient noisy.',
        url: '/hangar-zone/module/types?page=4',
        module: 'Module 02: Types',
        section: 'Pulse Jet',
        matchScore: 0
    },
    {
        title: 'Scramjet Engine',
        content: 'Scramjet supersonic combustion ramjet. Air flows through engine supersonic speeds. Used hypersonic flight applications experimental aircraft.',
        url: '/hangar-zone/module/types?page=4',
        module: 'Module 02: Types',
        section: 'Scramjet',
        matchScore: 0
    },

    // Module 3: Turbofan Engine Components
    {
        title: 'Air Inlet Function',
        content: 'Air inlet directs air engine compressor minimum loss energy. Must recover much ram pressure possible. Subsonic inlets divergent duct slow air. Supersonic inlets shock waves slow air subsonic speeds.',
        url: '/turbofan-engine?section=air-inlet',
        module: 'Module 03: Turbofan Components',
        section: 'Air Inlet',
        matchScore: 0
    },
    {
        title: 'Compressor Section',
        content: 'Compressor increases pressure air enters engine. Two types centrifugal axial flow compressors. Centrifugal compressor uses impeller accelerate air outward. Axial flow compressor uses rotating blades stationary vanes compress air stages.',
        url: '/turbofan-engine?section=compressor',
        module: 'Module 03: Turbofan Components',
        section: 'Compressor',
        matchScore: 0
    },
    {
        title: 'Centrifugal Compressor',
        content: 'Centrifugal compressor impeller accelerates air centrifugal force. Air enters axially exits radially. Diffuser converts kinetic energy pressure. Simple rugged used small engines.',
        url: '/turbofan-engine?section=compressor',
        module: 'Module 03: Turbofan Components',
        section: 'Centrifugal Compressor',
        matchScore: 0
    },
    {
        title: 'Axial Flow Compressor',
        content: 'Axial flow compressor air flows parallel engine centerline. Series rotating blades rotor stationary vanes stator. Each rotor stator pair stage. Multiple stages achieve high compression ratios. Used most modern jet engines.',
        url: '/turbofan-engine?section=compressor',
        module: 'Module 03: Turbofan Components',
        section: 'Axial Flow Compressor',
        matchScore: 0
    },
    {
        title: 'Rotor Blades',
        content: 'Rotor blades rotating airfoils accelerate compress air. Attached rotor disk various methods dovetail fir tree. Blade twist angle attack varies root tip. Prevent vibration failure.',
        url: '/turbofan-engine?section=compressor',
        module: 'Module 03: Turbofan Components',
        section: 'Rotor Blades',
        matchScore: 0
    },
    {
        title: 'Stator Vanes',
        content: 'Stator vanes stationary airfoils straighten airflow convert velocity pressure. Guide air next rotor stage correct angle. Shrouded unshrouded designs. Part compressor casing.',
        url: '/turbofan-engine?section=compressor',
        module: 'Module 03: Turbofan Components',
        section: 'Stator Vanes',
        matchScore: 0
    },
    {
        title: 'Compressor Stages',
        content: 'Each rotor stator pair compressor stage. Multiple stages needed achieve required pressure ratio. Dual spool triple spool designs separate compressor sections different speeds. Low pressure high pressure compressors.',
        url: '/turbofan-engine?section=compressor',
        module: 'Module 03: Turbofan Components',
        section: 'Compressor Stages',
        matchScore: 0
    },
    {
        title: 'Combustion Chamber',
        content: 'Combustion chamber burns fuel air mixture. Three main types can type annular type can-annular type. Primary zone secondary zone dilution zone. Fuel injected atomized ignited continuously burns.',
        url: '/turbofan-engine?section=combustor',
        module: 'Module 03: Turbofan Components',
        section: 'Combustion Chamber',
        matchScore: 0
    },
    {
        title: 'Turbine Section',
        content: 'Turbine extracts energy hot gases drive compressor accessories. High pressure turbine drives high pressure compressor. Low pressure turbine drives low pressure compressor fan. Turbine blades cooled prevent melting.',
        url: '/turbofan-engine?section=turbine',
        module: 'Module 03: Turbofan Components',
        section: 'Turbine',
        matchScore: 0
    },
    {
        title: 'Exhaust Section',
        content: 'Exhaust section directs gases rear engine produce thrust. Convergent nozzle subsonic flow. Convergent-divergent nozzle supersonic flow. Thrust reversers redirect exhaust forward landing.',
        url: '/turbofan-engine?section=exhaust',
        module: 'Module 03: Turbofan Components',
        section: 'Exhaust',
        matchScore: 0
    },
    {
        title: 'Fan Section',
        content: 'Fan large diameter compressor front turbofan engine. Provides most thrust accelerating bypass air around core. Bypass ratio determines engine efficiency. High bypass ratio quieter more efficient.',
        url: '/turbofan-engine?section=fan',
        module: 'Module 03: Turbofan Components',
        section: 'Fan',
        matchScore: 0
    }
];
