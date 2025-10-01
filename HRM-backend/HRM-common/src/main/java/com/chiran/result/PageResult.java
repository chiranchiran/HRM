package com.chiran.result;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * 分页记录，作为data传给Result
 * total:查询到的总的数据条数
 * records：分页查询时返回的本页展示的数据，不分页时返回总的数据
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> implements Serializable {
    private Integer total;
    private List<T> records;

}
