import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Grid,
  InputAdornment,
  Paper,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { createCoupon } from "../api/admin";
import { useNavigate } from "react-router-dom";

const CreateCouponContainer = () => {
  const [coupon, setCoupon] = useState({
    name: "",
    discountRate: "",
    maxDiscount: "",
    issueStartAt: null,
    issueEndAt: null,
    expirationAt: null,
    totalQuantity: "",
  });
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    let newValue = value;

    switch (name) {
      case "discountRate":
        newValue = Math.max(0, Math.min(100, parseInt(value) || 0));
        break;
      case "totalQuantity":
        newValue = Math.max(0, parseInt(value) || 0);
        break;
      case "maxDiscount":
        newValue = value.replace(/[^\d]/g, "");
        newValue = newValue ? Number(newValue).toLocaleString() : "";
        break;
      default:
        break;
    }

    setCoupon((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleDateTimeChange = (name) => (newValue) => {
    setCoupon((prev) => ({ ...prev, [name]: newValue }));
  };

  const validateDates = () => {
    const now = dayjs();

    if (coupon.issueStartAt && coupon.issueStartAt.isBefore(now)) {
      return "발행 시작 시간은 현재 시간 이후여야 합니다";
    }
    if (coupon.issueEndAt && coupon.issueEndAt.isBefore(coupon.issueStartAt)) {
      return "발행 종료 시간은 발행 시작 시간 이후여야 합니다";
    }
    if (
      coupon.expirationAt &&
      coupon.expirationAt.isBefore(coupon.issueEndAt)
    ) {
      return "쿠폰 만료 시간은 발행 종료 시간 이후여야 합니다";
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    for (const key in coupon) {
      if (coupon[key] === null || coupon[key] === "") {
        alert("모든 필드를 채워주세요");
        return null;
      }
    }

    if (parseInt(coupon.discountRate) === 0) {
      alert("할인율은 0보다 커야 합니다");
      return null;
    }
    if (parseInt(coupon.totalQuantity) === 0) {
      alert("쿠폰 수량은 0보다 커야 합니다");
      return null;
    }

    const validationError = validateDates();

    if (validationError) {
      alert(validationError);
    } else {
      const couponData = {
        ...coupon,
        discountRate: parseInt(coupon.discountRate),
        maxDiscount: parseInt(coupon.maxDiscount.replace(/,/g, "")),
        issueStartAt: dayjs(coupon.issueStartAt).format("YYYY-MM-DDTHH:mm:ss"),
        issueEndAt: dayjs(coupon.issueEndAt).format("YYYY-MM-DDTHH:mm:ss"),
        expirationAt: dayjs(coupon.expirationAt).format("YYYY-MM-DDTHH:mm:ss"),
      };
      try {
        await createCoupon(couponData);

        alert("쿠폰이 성공적으로 생성되었습니다");
        navigate(-1);
      } catch (error) {
        if (error.response.data.msg) {
          alert(error.response.data.msg);
        } else {
          alert("쿠폰 생성에 실패하였습니다");
        }
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ margin: "auto", mt: 1 }}
        >
          <Typography variant="h4" gutterBottom>
            쿠폰 생성하기
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                name="name"
                label="쿠폰 이름"
                value={coupon.name}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="normal"
                name="discountRate"
                label="할인율 (%)"
                value={coupon.discountRate}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 1, max: 100 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="normal"
                name="maxDiscount"
                label="최대 할인 금액"
                value={coupon.maxDiscount}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">원</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="normal"
                name="totalQuantity"
                label="쿠폰 수량"
                value={coupon.totalQuantity}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 0 },
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle1" gutterBottom>
                발행 시작 시간
              </Typography>
              <DateTimePicker
                value={coupon.issueStartAt}
                onChange={handleDateTimeChange("issueStartAt")}
                views={["year", "month", "day", "hours"]}
                format="YYYY년 MM월 DD일 HH시"
                ampm={false}
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle1" gutterBottom>
                발행 종료 시간
              </Typography>
              <DateTimePicker
                value={coupon.issueEndAt}
                onChange={handleDateTimeChange("issueEndAt")}
                views={["year", "month", "day", "hours"]}
                format="YYYY년 MM월 DD일 HH시"
                ampm={false}
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle1" gutterBottom>
                만료 시간
              </Typography>
              <DateTimePicker
                value={coupon.expirationAt}
                onChange={handleDateTimeChange("expirationAt")}
                views={["year", "month", "day", "hours"]}
                format="YYYY년 MM월 DD일 HH시"
                ampm={false}
                sx={{ width: "100%" }}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3,
              mr: 1,
            }}
          >
            <Button
              variant="outlined"
              sx={{
                mr: 1,
                mb: 1,
                fontSize: "1rem",
                border: `1px solid`,
                "&:hover": {
                  backgroundColor: "rgba(241, 125, 123, 0.04)",
                  border: `1px solid #E25350`,
                  color: "#E25350",
                },
                "&.MuiButton-containedError": {
                  border: `1px solid`,
                },
                color: "#F17D7B",
              }}
              onClick={() => navigate(-1)}
            >
              이전 페이지로
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                mb: 1,
                fontSize: "1rem",
                textShadow: "#000 0.7px 0.5px 2px",
                backgroundColor: "#87CEEB",
                "&:hover": { backgroundColor: "#2AAADE" },
              }}
            >
              쿠폰 생성
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateCouponContainer;
