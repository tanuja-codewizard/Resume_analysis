const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, ...value] = line.split('=');
    process.env[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
  }
});
const { createClient } = require('@supabase/supabase-js');

async function confirmUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or Service Role Key");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const emailToConfirm = '202501110023@mitaoe.ac.in';

  console.log(`Searching for user with email: ${emailToConfirm}...`);
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  const user = users.find(u => u.email === emailToConfirm);

  if (!user) {
    console.error(`User with email ${emailToConfirm} not found.`);
    return;
  }

  console.log(`Found user: ${user.id}. Confirming email...`);

  const { data, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { email_confirm: true }
  );

  if (updateError) {
    console.error("Error confirming user:", updateError);
  } else {
    console.log("Success! User email confirmed.");
  }
}

confirmUser();
