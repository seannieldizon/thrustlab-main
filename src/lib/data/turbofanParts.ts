export type TurbofanComponentGroup = {
	id: string;
	label: string;
	colorHint: string;
	description: string;
	keys: string[];
};

const componentGroups: TurbofanComponentGroup[] = [
	{
		id: 'air-inlet-duct',
		label: 'Air Inlet Duct',
		colorHint: 'Light blue front assembly',
		description:
			'The air inlet duct directs smooth, uniform air into the compressor, recovering pressure and ensuring the engine receives steady airflow for efficient operation.',
		keys: [
			'Material.046',
			'Material.006',
			'Material.007',
			'fan',
			'Fan Rotor',
			'FanRotor',
			'Light Blue',
			'LightBlue',
			'Air Inlet',
			'Inlet'
		]
	},
	{
		id: 'compressor-section',
		label: 'Compressor Section',
		colorHint: 'Green and Yellow stages',
		description:
			'The compressor pressurizes incoming air, supplying it to the combustion chamber and providing bleed air for aircraft systems.',
		keys: [
			// Gearbox & LPC (greens)
			'Material.018',
			'Gearbox',
			'gearbox',
			'Metallic Grey',
			'Material.008',
			'Material.009',
			'Material.010',
			'Material.011',
			'Material.012',
			'Material.013',
			'Material.014',
			'Material.015',
			'Material.016',
			'Material.017',
			'Material.020',
			'Material.049',
			'LowPressureCompressor',
			'LPC',
			'low-pressure compressor',
			'HighPressureCompressor',
			'HPC',
			'high-pressure compressor'
		]
	},
	{
		id: 'combustion-section',
		label: 'Combustion Section',
		colorHint: 'Grey ring in the middle',
		description:
			'The combustion section mixes fuel and compressed air, ignites the mixture, and generates high-energy gases to power the turbine.',
		keys: [
			'Material.019',
			'Material.021',
			'Material.022',
			'Material.023',
			'Material.024',
			'Material.025',
			'Material.026',
			'Material.027',
			'Material.028',
			'Material.029',
			'Material.044',
			'Material.045',
			'Material.048',
			'Combustor',
			'Combustion Chamber',
			'Combustion Section'
		]
	},
	{
		id: 'turbine-section',
		label: 'Turbine Section',
		colorHint: 'Orange and Dark Blue stages',
		description:
			'The turbine extracts energy from the hot gases to drive the compressor and engine accessories, using blades shaped for maximum efficiency.',
		keys: [
			// HPT
			'Material.047',
			'Material.030',
			'Material.031',
			'Material.032',
			'Material.033',
			'Material.034',
			'Material.035',
			'Material.036',
			'Material.037',
			'Material.038',
			'Material.039',
			'Material.040',
			'HighPressureTurbine',
			'HPT',
			'high-pressure turbine',
			// LPT core stages
			'LowPressureTurbine',
			'LPT',
			'low-pressure turbine'
		]
	},
	{
		id: 'exhaust-section',
		label: 'Exhaust Section',
		colorHint: 'Rear exhaust components',
		description:
			'The exhaust section directs hot gases out of the engine, increasing thrust and, in some designs, mixing with bypass air for efficiency.',
		keys: [
			'Exhaust',
			'exhaust',
			'Nozzle',
			'nozzle',
			'Exhaust Section',
			'Tailpipe',
			'Cone',
			'Material.041',
			'Material.042',
			'Material.043'
		]
	}
];

export const turbofanComponentGroups = componentGroups;

export const turbofanPartDescriptions: Record<string, { name: string; description: string }> =
	componentGroups.reduce((acc, group) => {
		for (const key of group.keys) {
			acc[key] = { name: group.label, description: group.description };
		}
		return acc;
	}, {} as Record<string, { name: string; description: string }>);
