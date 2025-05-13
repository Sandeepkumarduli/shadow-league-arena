
-- Function to add funds to admin wallet
CREATE OR REPLACE FUNCTION add_funds_to_admin_wallet(
  p_amount INTEGER,
  p_description TEXT,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_admin_wallet_id UUID;
BEGIN
  -- Get admin wallet ID
  SELECT id INTO v_admin_wallet_id FROM admin_wallet LIMIT 1;
  
  -- Update admin wallet balance
  UPDATE admin_wallet
  SET 
    balance = balance + p_amount,
    updated_at = NOW()
  WHERE id = v_admin_wallet_id;
  
  -- Insert transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    description,
    status
  ) VALUES (
    p_user_id,
    'credit',
    p_amount,
    p_description,
    'completed'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to transfer funds from admin wallet to user
CREATE OR REPLACE FUNCTION transfer_from_admin_to_user(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_admin_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_admin_wallet_id UUID;
  v_admin_balance INTEGER;
BEGIN
  -- Get admin wallet ID and balance
  SELECT id, balance INTO v_admin_wallet_id, v_admin_balance FROM admin_wallet LIMIT 1;
  
  -- Check if admin wallet has enough balance
  IF v_admin_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Update admin wallet balance
  UPDATE admin_wallet
  SET 
    balance = balance - p_amount,
    updated_at = NOW()
  WHERE id = v_admin_wallet_id;
  
  -- Update user wallet balance
  UPDATE wallets
  SET 
    balance = balance + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Insert transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    description,
    status
  ) VALUES (
    p_user_id,
    'credit',
    p_amount,
    p_description,
    'completed'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to transfer funds from user to admin wallet
CREATE OR REPLACE FUNCTION transfer_from_user_to_admin(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_admin_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_admin_wallet_id UUID;
  v_user_balance INTEGER;
BEGIN
  -- Get admin wallet ID
  SELECT id INTO v_admin_wallet_id FROM admin_wallet LIMIT 1;
  
  -- Get user balance
  SELECT balance INTO v_user_balance FROM wallets WHERE user_id = p_user_id;
  
  -- Check if user wallet has enough balance
  IF v_user_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Update user wallet balance
  UPDATE wallets
  SET 
    balance = balance - p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Update admin wallet balance
  UPDATE admin_wallet
  SET 
    balance = balance + p_amount,
    updated_at = NOW()
  WHERE id = v_admin_wallet_id;
  
  -- Insert transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    description,
    status
  ) VALUES (
    p_user_id,
    'debit',
    p_amount,
    p_description,
    'completed'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add coins to user (without affecting admin wallet)
CREATE OR REPLACE FUNCTION add_coins_to_user(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_admin_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update user wallet balance
  UPDATE wallets
  SET 
    balance = balance + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Insert transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    description,
    status
  ) VALUES (
    p_user_id,
    'credit',
    p_amount,
    p_description,
    'completed'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct coins from user (without affecting admin wallet)
CREATE OR REPLACE FUNCTION deduct_coins_from_user(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_admin_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_balance INTEGER;
BEGIN
  -- Get user balance
  SELECT balance INTO v_user_balance FROM wallets WHERE user_id = p_user_id;
  
  -- Check if user wallet has enough balance
  IF v_user_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Update user wallet balance
  UPDATE wallets
  SET 
    balance = balance - p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Insert transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    description,
    status
  ) VALUES (
    p_user_id,
    'debit',
    p_amount,
    p_description,
    'completed'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
