// Script to populate cuisines table in Supabase
// Run with: node scripts/seed-cuisines.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const cuisines = [
    { name: 'Afghan', description: 'Afghan cuisine' },
    { name: 'American', description: 'American cuisine' },
    { name: 'Argentine', description: 'Argentine cuisine' },
    { name: 'Armenian', description: 'Armenian cuisine' },
    { name: 'Asian Fusion', description: 'Asian Fusion cuisine' },
    { name: 'Bakeries', description: 'Bakeries and baked goods' },
    { name: 'BBQ', description: 'Barbecue' },
    { name: 'Brazilian', description: 'Brazilian cuisine' },
    { name: 'Breakfast & Brunch', description: 'Breakfast and brunch' },
    { name: 'Bubble Tea', description: 'Bubble tea and tea drinks' },
    { name: 'Burgers', description: 'Burgers and burger joints' },
    { name: 'Burmese', description: 'Burmese cuisine' },
    { name: 'Cafes', description: 'Cafes and coffee shops' },
    { name: 'Cajun/Creole', description: 'Cajun and Creole cuisine' },
    { name: 'Caribbean', description: 'Caribbean cuisine' },
    { name: 'Caterers', description: 'Catering services' },
    { name: 'Cheesesteaks', description: 'Cheesesteaks' },
    { name: 'Chicken Wings', description: 'Chicken wings' },
    { name: 'Chinese', description: 'Chinese cuisine' },
    { name: 'Coffee & Tea', description: 'Coffee and tea' },
    { name: 'Colombian', description: 'Colombian cuisine' },
    { name: 'Comfort Food', description: 'Comfort food' },
    { name: 'Desserts', description: 'Desserts and sweets' },
    { name: 'Dim Sum', description: 'Dim sum' },
    { name: 'Donuts', description: 'Donuts and doughnuts' },
    { name: 'Ethiopian', description: 'Ethiopian cuisine' },
    { name: 'Fast Food', description: 'Fast food' },
    { name: 'Filipino', description: 'Filipino cuisine' },
    { name: 'Food Trucks', description: 'Food trucks' },
    { name: 'French', description: 'French cuisine' },
    { name: 'Georgian', description: 'Georgian cuisine' },
    { name: 'Greek', description: 'Greek cuisine' },
    { name: 'Halal', description: 'Halal food' },
    { name: 'Hawaiian', description: 'Hawaiian cuisine' },
    { name: 'Healthy', description: 'Healthy food options' },
    { name: 'Himalayan/Nepalese', description: 'Himalayan and Nepalese cuisine' },
    { name: 'Indian', description: 'Indian cuisine' },
    { name: 'Indonesian', description: 'Indonesian cuisine' },
    { name: 'Iranian', description: 'Iranian cuisine' },
    { name: 'Italian', description: 'Italian cuisine' },
    { name: 'Japanese', description: 'Japanese cuisine' },
    { name: 'Korean', description: 'Korean cuisine' },
    { name: 'Laotian', description: 'Laotian cuisine' },
    { name: 'Latin American', description: 'Latin American cuisine' },
    { name: 'Lebanese', description: 'Lebanese cuisine' },
    { name: 'Mediterranean', description: 'Mediterranean cuisine' },
    { name: 'Mexican', description: 'Mexican cuisine' },
    { name: 'Middle Eastern', description: 'Middle Eastern cuisine' },
    { name: 'Noodles', description: 'Noodle dishes' },
    { name: 'Pakistani', description: 'Pakistani cuisine' },
    { name: 'Pasta', description: 'Pasta dishes' },
    { name: 'Persian', description: 'Persian cuisine' },
    { name: 'Pizza', description: 'Pizza' },
    { name: 'Poke', description: 'Poke bowls' },
    { name: 'Ramen', description: 'Ramen' },
    { name: 'Salad', description: 'Salads' },
    { name: 'Sandwiches', description: 'Sandwiches' },
    { name: 'Steakhouses', description: 'Steakhouses' },
    { name: 'Sushi Bars', description: 'Sushi bars' },
    { name: 'Taiwanese', description: 'Taiwanese cuisine' },
    { name: 'Tex-Mex', description: 'Tex-Mex cuisine' },
    { name: 'Thai', description: 'Thai cuisine' },
    { name: 'Vegan', description: 'Vegan food' },
    { name: 'Vegetarian', description: 'Vegetarian food' },
    { name: 'Venezuelan', description: 'Venezuelan cuisine' },
    { name: 'Vietnamese', description: 'Vietnamese cuisine' },
    { name: 'Wraps', description: 'Wraps and rolled sandwiches' }
];

async function seedCuisines() {
    console.log('🌱 Starting cuisine seed...');
    console.log(`📊 Total cuisines to insert: ${cuisines.length}`);

    try {
        // Insert all cuisines
        const { data, error } = await supabase
            .from('cuisines')
            .upsert(cuisines, {
                onConflict: 'name',
                ignoreDuplicates: true
            })
            .select();

        if (error) {
            console.error('❌ Error inserting cuisines:', error);
            process.exit(1);
        }

        console.log(`✅ Successfully seeded ${cuisines.length} cuisines!`);

        // Verify count
        const { count, error: countError } = await supabase
            .from('cuisines')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Error counting cuisines:', countError);
        } else {
            console.log(`📈 Total cuisines in database: ${count}`);
        }

        console.log('✨ Cuisine seeding complete!');
    } catch (err) {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    }
}

seedCuisines();
