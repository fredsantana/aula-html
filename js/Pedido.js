$(document).ready(function() {
			
	$.ajax({ 
		 type: "GET",
		 dataType: "json",
		 url: "http://localhost:8080/restee/api/pedidos",
		 success: function(data){
			if(data.Exception != "")
				alert(data.Exception);
			else
				createTable(data.Content);
		 }
	});
	 
	prodId = getParameterByName("prod");
	if(prodId != null && prodId != ""){
		CarregarVisualizar(prodId);
	}
});

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function CarregarVisualizar(prodId){
	$.ajax({ 
		 type: "GET",
		 dataType: "json",
		 url: "http://localhost:8080/restee/api/pedidos",
		 success: function(data){
			if(data.Exception != "")
				alert(data.Exception);
			else{		 
				//Professor, o mavem comecou a dar problemas no findById, e não consegui resolver, por isso estou fazendo dessa forma
				$.each(data.Content,function(clientIdx,item){
					if(item.id+"" == prodId){
						carregarTelaVisualizar(item);
					}
				});
			}
		 }
	});
}

function createTable(data){

	  var rowHtml = '<tr><th>ID</th><th>CPF</th><th>Nome</th><th>Data</th><th>Ações</th></tr>';
	  $.each(data,function(clientIdx,item){
		rowHtml+="<td>"+item.id+"</td>";
		rowHtml+='<td>'+item.cpf+'</td>';
		rowHtml+='<td>'+item.nome+'</td>';
		rowHtml+='<td>'+item.dataPedido+'</td>';
		rowHtml+="<td><a  href='VisualizarPedido.html?prod="+ item.id +"' class='btn btn-link btn-cons' id='visualizar' > Visualizar</a></td></tr>";

	  });

	  $('#pedidos').html(rowHtml);

}

function carregarTelaVisualizar(item){

	$("#campoCPF").val(item.cpf);
	$("#campoNome").val(item.nome);
	$("#campoEnd").val(item.enderecoEntrega);
	$("#campoData").val(item.dataPedido);
	$("#campoTotal").val(item.total);
	  
	createTableProdutos(item.itens);

}

function createTableProdutos(data){

	  var rowHtml = '<tr><th>Nome</th><th>Descrição</th><th>Quantidade</th><th>Total</th></tr>';
	  $.each(data,function(clientIdx,item){
		rowHtml+="<tr>";
		rowHtml+='<td>'+item.pk.produto.nome+'</td>';
		rowHtml+='<td>'+item.pk.produto.descricao+'</td>';
		rowHtml+='<td>'+item.quantidade+'</td>';
		rowHtml+='<td>R$ '+item.total.toFixed(2).replace(".", ",")+'</td>';
		rowHtml+="</tr>";
	  });

	  $('#produtostable').html(rowHtml);

}

function Salvar(){

	var campoCPF = $('#campoCPF').val();
	var campoNome = $('#campoNome').val();
	var campoEnd = $('#campoEnd').val();
	var campoData = $('#dp1').val();

	var formData = '{"pedido.cpf":'+campoCPF+',"pedido.nome":"'+campoNome+'", "pedido.enderecoEntrega":"'+campoEnd+'", "pedido.dataPedido":"'+campoData+'", ';
	
	var indexProd = 0;
	$('tr[id^="addr"]').each(function(){
		if($(this).html().indexOf("td") != -1){
			var index = $(this).attr('id').replace("addr","");
			if($('#ddprod' + index).val() != 0){
				if(indexProd > 0)
					formData += ", ";
				var quant = $('#idquant'+index).val();
				var id = $('#ddprod'+index).val();
				formData += '"pedido.produto.id['+indexProd+']":'+id+", ";
				formData += '"pedido.produto.qtd['+indexProd+']":'+quant;
				indexProd++;
			}
		}
	});
	
	formData += "}";
	
	if(indexProd == 0){
		alert("Pedido deve haver pelo menos um produto na lista");
		return;
	}
	 
	var obj = JSON && JSON.parse(formData) || $.parseJSON(formData);
	 
	jQuery.ajax({
		url: 'http://localhost:8080/restee/api/pedidos',
		type: 'POST',
		dataType: 'json',
		mimeType: "multipart/form-data",
		data: obj,
		success: function(info) {
			if(info.Exception != "")
				alert(info.Exception);
			else{
				alert("Pedido realizado com sucesso.");
				window.location.href = "ListagemPedidos.html";
			}
		}
	});
}

function obterProdutosParaPedido(index){

	$.ajax({ 
		 type: "GET",
		 dataType: "json",
		 url: "http://localhost:8080/restee/api/produtos",
		 success: function(data){        
			if(data.Exception != "")
				alert(data.Exception);
			else{
				var lista = [];
				$.each(data.Content,function(clientIdx,item){
					if(item.quantidade > 0){
						lista.push(item);
					}
				});
				
				createLista(lista, index);
			}
		 }
	 });
}

function createLista(lista, index){
	var rowHtml = "<option value='0'>Selecione</option>";
	$.each(lista,function(clientIdx,item){
		rowHtml+="<option value='" + item.id + "'>"+item.nome+"</option>";
	});

	$('#ddprod'+ index).html(rowHtml);

	$('#ddprod'+ index).change(function() {
		var choice = $(this).val();
		SelecionarProduto(choice, index);
	});
}

function SelecionarProduto(id, index){
	if(id == "0" || VerificarProdutoListado(id, index)){
		/*$('#desc'+ index).html("");
		$('#valor'+ index).html("");
		$('#divquant'+ index).css("visibility", "hidden");
		$('#idquant'+index).val("1");*/
		$("#addr"+index).html('');
		atualizarTotais();
	}
	else{
		$.ajax({ 
			 type: "GET",
			 dataType: "json",
			 url: "http://localhost:8080/restee/api/produtos/" + id,
			 success: function(data){
				if(data.Exception != "")
					alert(data.Exception);
				else{
					$('#desc'+ index).html(data.Content.descricao);
					$('#valor'+ index).html("R$ " + data.Content.valor.toFixed(2).replace(".", ","));
					$('#divquant'+ index).css("visibility", "visible");
					$('#idquant'+index).attr("max", data.Content.quantidade+"");
					$('#idquant'+index).val("1");
					InsertMinMax();
					atualizarTotais();
				}
			 }
		 });
	 }
}

function VerificarProdutoListado(id, index){
	var retorno = false;
	$('tr[id^="addr"] select').each(function(){
		var choice = $(this).val();
		var idselect = $(this).attr('id').replace("ddprod","");
		if(choice == id && idselect != index ){
			alert("Produto já existe está na lista");
			$('#ddprod'+index).val(0);
			retorno = true;
		}
	});
	return retorno;
}

function InsertMinMax(){
	//plugin bootstrap minus and plus
	//http://jsfiddle.net/laelitenetwork/puJ6G/
	$('.btn-number').removeAttr("disabled");
	$('.btn-number').off("click").click(function(e){
		e.preventDefault();
		
		fieldName = $(this).attr('data-field');
		type      = $(this).attr('data-type');
		var input = $("input[name='"+fieldName+"']");
		var currentVal = parseInt(input.val());
		if (!isNaN(currentVal)) {
			if(type == 'minus') {
				
				if(currentVal > input.attr('min')) {
					input.val(currentVal - 1).change();
				} 
				if(parseInt(input.val()) == input.attr('min')) {
					$(this).attr('disabled', true);
				}

			} else if(type == 'plus') {

				if(currentVal < input.attr('max')) {
					input.val(currentVal + 1).change();
				}
				if(parseInt(input.val()) == input.attr('max')) {
					$(this).attr('disabled', true);
				}

			}
		} else {
			input.val(0);
		}
	});
	$('.input-number').focusin(function(){
	   $(this).data('oldValue', $(this).val());
	});
	$('.input-number').change(function() {
		
		minValue =  parseInt($(this).attr('min'));
		maxValue =  parseInt($(this).attr('max'));
		valueCurrent = parseInt($(this).val());
		
		name = $(this).attr('name');
		if(valueCurrent >= minValue) {
			$(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
		} else {
			alert('minimo valor não permitido');
			$(this).val($(this).data('oldValue'));
		}
		if(valueCurrent <= maxValue) {
			$(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
		} else {
			alert('Valor ultrapassa a quatidade de produtos disponíveis');
			$(this).val($(this).data('oldValue'));
		}
		
		atualizarTotais();
		
	});
	$(".input-number").keydown(function (e) {
			// Allow: backspace, delete, tab, escape, enter and .
			if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
				 // Allow: Ctrl+A
				(e.keyCode == 65 && e.ctrlKey === true) || 
				 // Allow: home, end, left, right
				(e.keyCode >= 35 && e.keyCode <= 39)) {
					 // let it happen, don't do anything
					 return;
			}
			// Ensure that it is a number and stop the keypress
			if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
				e.preventDefault();
			}
		});
}

function atualizarTotais(){
	var total = 0;
	$('tr[id^="addr"]').each(function(){
		if($(this).html().indexOf("td") != -1){
			var index = $(this).attr('id').replace("addr","");
			if($('#ddprod' + index).val() != 0){
				var quant = $('#idquant'+index).val();
				var valor = $('#valor'+index).html().replace("R$ ","").replace(",",".");
				var totalprod = parseFloat(quant) * parseFloat(valor);
				$('#total'+index).html("R$ " + totalprod.toFixed(2).replace(".", ","));
				total += totalprod;
			}
		}
	});
	$('#campoTotal').val("R$ " + total.toFixed(2).replace(".", ","));
}