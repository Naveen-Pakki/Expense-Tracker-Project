package com.expensetracker.service;

import com.expensetracker.dto.AuthResponseDto;
import com.expensetracker.dto.UserLoginDto;
import com.expensetracker.dto.UserRegisterDto;
import com.expensetracker.entity.User;

public interface AuthService {
    AuthResponseDto login(UserLoginDto loginDto);
    String register(UserRegisterDto registerDto);
    User getCurrentAuthenticatedUser();
}
