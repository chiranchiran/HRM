import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getLoginData, removeAllData, removeLoginData, setLoginData } from "../../utils/localStorage";
/**redux管理数据
 * id
 * uername
 * role
 * isAuthenticated
 */
//refreshToken获得最新的accessToekn
export const refreshToken = createAsyncThunk('auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = getLoginData()[1]
      if (!refreshToken) {
        logger.warn("没有refreshToken")
        return rejectWithValue('没有刷新令牌')
      }
      const res = await refresh(refreshToken)
      return res.data
    } catch (error) {
      return rejectWithValue(error.message || '登录失败')
    }
  }
)
//用户认证相关
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    username: '',
    id: null,
    role: null,
    isAuthenticated: false
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.username = action.payload.username;
      state.id = action.payload.id;
      state.role = action.payload.role;
    },
    loginFailure: (state) => {
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.username = ''
      state.id = null
      state.role = null
      state.isAuthenticated = false
      removeAllData()
    }
  },
  extraReducers: (builder) => {
    builder
      //refresh开始
      .addCase(refreshToken.pending, (state) => {
        state.isAuthenticated = false
      })
      //refresh成功
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.username = action.payload.username
        state.id = action.payload.id
        state.role = action.payload.role
        state.isAuthenticated = true
        setLoginData(action.payload.accessToken, action.payload.refreshToken)
      })
      //refresh失败
      .addCase(refreshToken.rejected, (state, action) => {
        state.username = ''
        state.id = null
        state.role = null
        removeLoginData()
      })
  }
})

export const { logout, loginSuccess, loginFailure } = authSlice.actions
export default authSlice.reducer