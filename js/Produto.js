$(document).ready(function() {
			
	$.ajax({ 
		 type: "GET",
		 dataType: "json",
		 url: "http://localhost:8080/restee/api/produtos",
		 success: function(data){        
			//$('#teste').html(data['Content']);
			createTable(data.Content);
		 }
	 });
});

function createTable(data){
	var headers=[""], rows={}

	  var rowHtml = '<tr><th>ID</th><th>Nome</th><th>Descrição</th><th>Quantidade</th><th>Valor</th><th></th></tr>';//'<table class="table table-striped">';
	  $.each(data,function(clientIdx,item){
		rowHtml+="<tr onclick='Selecionar("+item.id+");'>";
		rowHtml+="<td>"+item.id+"</td>";
		rowHtml+='<td>'+item.nome+'</td>';
		rowHtml+='<td>'+item.descricao+'</td>';
		rowHtml+='<td>'+item.quantidade+'</td>';
		rowHtml+='<td>'+item.valor+'</td>';
		rowHtml+="<td><button onclick='Deletar(" + item.id + ")' type='button' class='btn btn-sm btn-danger glyphicon glyphicon-trash'> Excluir</button></td></tr>";

	  });
	  //rowHtml += '</table>';

	  $('#table').html(rowHtml);

}

function Selecionar(id){
	$.ajax({ 
		 type: "GET",
		 dataType: "json",
		 url: "http://localhost:8080/restee/api/produtos/" + id,
		 success: function(data){        
			$('#campoID').val(data.Content.id);
			$('#campoNome').val(data.Content.nome);
			$('#campoDesc').val(data.Content.descricao);
			$('#campoQuant').val(data.Content.quantidade);
			$('#campoValor').val(data.Content.valor);
		 }
	 });
}

function Deletar(id){
	$.ajax({ 
		 type: "GET",
		 dataType: "json",
		 url: "http://localhost:8080/restee/api/produtos/delete/" + id,
		 success: function(data){        
			alert("Registro excluído com sucesso.");
			Buscar();
		 }
	 });
}

function Buscar(){

	var nome = $('#campoBusca').val();

	$.ajax({ 
		 type: "GET",
		 dataType: "json",
		 url: "http://localhost:8080/restee/api/produtos",
		 success: function(data){        
			
			var lista = [];
			if(nome != ""){
				$.each(data.Content,function(clientIdx,item){
					if(item.nome.indexOf(nome) > -1){
						lista.push(item);
					}
				});
				
				createTable(lista);
			}
			else{
				createTable(data.Content);
			}
		 }
	 });
}

function Novo(){

	$('#campoID').val("");
	$('#campoNome').val("");
	$('#campoDesc').val("");
	$('#campoQuant').val("");
	$('#campoValor').val("");
	
}

function Salvar(){

	var campoID = $('#campoID').val();
	var campoNome = $('#campoNome').val();
	var campoDesc = $('#campoDesc').val();
	var campoQuant = $('#campoQuant').val();
	var campoValor = $('#campoValor').val();

	var formData = {"produto.nome":campoNome,"produto.descricao":campoDesc, "produto.quantidade":campoQuant, "produto.valor":campoValor};
	 
	 if(campoID != ""){
		 $.ajax({
			url: 'http://localhost:8080/restee/api/produtos/' + campoID,
			type: 'POST',
			dataType: 'json',
			mimeType: "multipart/form-data",
			data: formData,
			success: function(info) {
				alert("Registro salvo com sucesso.");
				Buscar();
			}
		 });
	 }
	 else{
		jQuery.ajax({
			url: 'http://localhost:8080/restee/api/produtos',
			type: 'POST',
			dataType: 'json',
			mimeType: "multipart/form-data",
			data: formData,
			success: function(info) {
				alert("Registro salvo com sucesso.");
				$('#campoID').val(info.Content.id);
				Buscar();
			}
		 });
	 }
}